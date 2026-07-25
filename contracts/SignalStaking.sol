// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title SignalStaking
 * @author OREBOT Network
 * @notice A TREND-denominated prediction market over OREBOT-mined signals.
 *
 *   Stakers bet YES (signal is high-value) or NO (signal is junk) by locking TREND.
 *   The Guardian/oracle (REPORTER_ROLE) settles with a verified outcome.
 *     - If the signal is VERIFIED (true):  YES bettors win. NO pool is split 50/50:
 *         50% distributed to YES bettors (proportional to stake), 50% BURNED to dead.
 *         YES bettors also receive an ORE mining reward (minted).
 *     - If the signal is REJECTED (false): NO bettors win. YES pool split 50/50:
 *         50% to NO bettors, 50% BURNED. No ORE minted.
 *
 *   This creates genuine TREND demand (must acquire TREND to stake) AND a deflationary
 *   burn sink (half the losing pool), while ORE rewards real signal-mining. That is the
 *   "burn-and-mine flywheel": mining activity burns TREND and mints ORE.
 *
 * AUDITOR FOCUS:
 *  - Settlement arithmetic: pool shares computed proportionally; no rounding steals.
 *  - ORE mint only to verified YES winners; never on rejection.
 *  - Pull-over-push: winners claim via claim(); burn happens at settle (no external calls).
 *  - TREND "burn" = transfer to 0x000...dEaD (TREND has no burn fn we control).
 *  - Reentrancy: state (settled flags, pending) updated before transfers.
 */
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {OREToken} from "./OREToken.sol";

contract SignalStaking is AccessControl, ReentrancyGuard {
    bytes32 public constant REPORTER_ROLE = keccak256("REPORTER_ROLE");

    IERC20 public immutable trend;   // existing $TREND (Trends Mining Simulator)
    OREToken public immutable ore;   // $ORE reward token (this contract holds MINTER_ROLE)
    address public constant DEAD = 0x000000000000000000000000000000000000dEaD;

    uint256 public oreRewardPerYesStake = 1 * 10 ** 18; // 1 ORE per TREND staked on winning YES (tunable)
    uint256 public burnBps = 5000; // 50% of losing pool burned; rest to winners (tunable, max 10000)

    struct Market {
        bytes32 signalRef;       // keccak256 of the off-chain Signal entity id
        uint256 yesPool;         // total TREND staked YES
        uint256 noPool;          // total TREND staked NO
        bool settled;
        bool verified;           // outcome (only meaningful once settled)
        uint256 winningPool;     // snapshot of the losing pool size at settle (for share math)
        uint256 burnAmount;      // amount burned at settle
    }

    mapping(bytes32 => Market) public markets;                     // signalRef -> market
    mapping(bytes32 => mapping(address => uint256)) public yesStake; // signalRef -> staker -> amount
    mapping(bytes32 => mapping(address => uint256)) public noStake;
    mapping(bytes32 => mapping(address => bool)) public claimed;   // signalRef -> staker -> claimed

    event MarketOpened(bytes32 indexed signalRef);
    event Staked(bytes32 indexed signalRef, address indexed staker, bool isYes, uint256 amount);
    event Settled(bytes32 indexed signalRef, bool verified, uint256 winningPool, uint256 burnAmount, uint256 oreMinted);
    event Claimed(bytes32 indexed signalRef, address indexed staker, uint256 trendPayout, uint256 orePayout);

    error ZeroAmount();
    error AlreadySettled();
    error NotSettled();
    error AlreadyClaimed();
    error NotWinner();
    error TransferFailed();
    error InvalidBurnBps();

    constructor(address trendToken, address oreToken) {
        trend = IERC20(trendToken);
        ore = OREToken(oreToken);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(REPORTER_ROLE, msg.sender);
    }

    /// @notice Stake TREND on a signal. isYes=true bets the signal is high-value.
    function stake(bytes32 signalRef, bool isYes, uint256 amount) external nonReentrant {
        if (amount == 0) revert ZeroAmount();
        Market storage m = markets[signalRef];
        if (m.settled) revert AlreadySettled();
        if (m.yesPool == 0 && m.noPool == 0) emit MarketOpened(signalRef);

        bool ok = trend.transferFrom(msg.sender, address(this), amount);
        if (!ok) revert TransferFailed();

        if (isYes) { m.yesPool += amount; yesStake[signalRef][msg.sender] += amount; }
        else { m.noPool += amount; noStake[signalRef][msg.sender] += amount; }
        emit Staked(signalRef, msg.sender, isYes, amount);
    }

    /// @notice Guardian/oracle settles a market with the verified outcome.
    function settle(bytes32 signalRef, bool verified) external onlyRole(REPORTER_ROLE) {
        Market storage m = markets[signalRef];
        if (m.settled) revert AlreadySettled();
        m.settled = true;
        m.verified = verified;

        uint256 losingPool = verified ? m.noPool : m.yesPool;
        uint256 burn = (losingPool * burnBps) / 10000;
        m.winningPool = losingPool - burn; // portion distributed to winners
        m.burnAmount = burn;

        if (burn > 0) { bool ok = trend.transfer(DEAD, burn); if (!ok) revert TransferFailed(); }

        // ORE reward to verified YES winners (proportional to their YES stake).
        uint256 oreMinted = 0;
        if (verified && m.yesPool > 0) {
            oreMinted = m.yesPool * oreRewardPerYesStake / 1e18; // 1 ORE per 1 TREND staked (configurable)
            if (oreMinted > 0) ore.mint(address(this), oreMinted); // winners claim via claim()
        }
        emit Settled(signalRef, verified, m.winningPool, burn, oreMinted);
    }

    /// @notice A winning staker claims their TREND share (+ ORE if verified YES winner).
    function claim(bytes32 signalRef) external nonReentrant {
        Market storage m = markets[signalRef];
        if (!m.settled) revert NotSettled();
        if (claimed[signalRef][msg.sender]) revert AlreadyClaimed();
        claimed[signalRef][msg.sender] = true;

        bool winnerSide = m.verified; // verified -> YES wins; rejected -> NO wins
        uint256 myStake = winnerSide ? yesStake[signalRef][msg.sender] : noStake[signalRef][msg.sender];
        if (myStake == 0) revert NotWinner();
        uint256 totalWinningSide = winnerSide ? m.yesPool : m.noPool;

        // Payout = original stake back + proportional share of the losing pool (winningPool portion).
        uint256 payout = myStake + (m.winningPool * myStake) / totalWinningSide;
        if (payout > 0) { bool ok = trend.transfer(msg.sender, payout); if (!ok) revert TransferFailed(); }

        // ORE reward only to verified YES winners.
        uint256 orePayout = 0;
        if (m.verified) {
            orePayout = (myStake * oreRewardPerYesStake) / 1e18;
            if (orePayout > 0) ore.transfer(msg.sender, orePayout);
        }
        emit Claimed(signalRef, msg.sender, payout, orePayout);
    }

    function setBurnBps(uint256 bps) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (bps > 10000) revert InvalidBurnBps();
        burnBps = bps;
    }

    function setOreRewardPerYesStake(uint256 r) external onlyRole(DEFAULT_ADMIN_ROLE) {
        oreRewardPerYesStake = r;
    }

    function getMarket(bytes32 signalRef) external view returns (Market memory) {
        return markets[signalRef];
    }
}

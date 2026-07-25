// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title OREBOTRegistry
 * @author OREBOT Network
 * @notice On-chain registry of the OREBOT workforce. Maps each OREBOT (by callsign)
 *         to its operator wallet, class, status, and on-chain reputation.
 *         The Registry is the only authorized MINTER of $ORE — it emits rewards
 *         as OREBOTs complete recorded work (signals mined, tasks executed).
 *
 * Flow:
 *  1. DEFAULT_ADMIN registers an OREBOT with its operator wallet + class.
 *  2. Trusted reporters (Guardian / oracle role) call `recordWork` when an OREBOT
 *     completes verified on-chain work, which bumps reputation and mints an ORE reward.
 *  3. `setWallet` lets an operator rotate their signing key without losing identity.
 *
 * AUDITOR FOCUS:
 *  - Only REPORTER_ROLE can mint rewards via recordWork; reward amounts are bounded.
 *  - recordWork cannot exceed the ORE cap (mint will revert on overflow).
 *  - Callsign uniqueness is enforced; wallets can back at most one OREBOT.
 */
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {OREToken} from "./OREToken.sol";

contract OREBOTRegistry is AccessControl {
    bytes32 public constant REPORTER_ROLE = keccak256("REPORTER_ROLE");

    /// @dev ORE reward per verified work unit. 1 ORE (tunable by governance).
    uint256 public rewardPerWork = 1 * 10 ** 18;

    enum Class { Miner, Analyst, Builder, Guardian, Scout, Prospector }
    enum Status { Inactive, Active, Mining, Penalized, Retired }

    struct Orebot {
        bytes32 callsign;     // e.g. keccak256("ORE-001")
        string callsignText;  // human-readable "ORE-001"
        address wallet;       // operator signing wallet
        Class class;
        Status status;
        uint256 reputation;   // 0-1000 scale, 500 = neutral start
        uint256 signalsMined;
        uint256 tasksCompleted;
    }

    OREToken public immutable ore;

    mapping(bytes32 => uint256) public callsignToId; // callsign hash -> OREBOT id (1-based)
    mapping(address => bytes32) public walletToCallsign; // wallet -> its OREBOT callsign
    mapping(uint256 => Orebot) public orebots; // id -> OREBOT record
    uint256 public nextId = 1;

    event OREBOTRegistered(uint256 indexed id, bytes32 indexed callsign, string callsignText, address wallet, Class class);
    event WalletRotated(bytes32 indexed callsign, address oldWallet, address newWallet);
    event WorkRecorded(bytes32 indexed callsign, uint256 signalsMined, uint256 tasksCompleted, uint256 rewardMinted, uint256 newReputation);
    event StatusChanged(bytes32 indexed callsign, Status newStatus);
    event RewardPerWorkUpdated(uint256 newReward);

    error ZeroAddress();
    error CallsignTaken();
    error WalletInUse();
    error NotRegistered();
    error InvalidReputation();

    constructor(address oreToken) {
        ore = OREToken(oreToken);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(REPORTER_ROLE, msg.sender);
    }

    /// @notice Register a new OREBOT. Admin-only; used during workforce seeding.
    function register(string calldata callsignText, address wallet, Class class) external onlyRole(DEFAULT_ADMIN_ROLE) returns (uint256 id) {
        if (wallet == address(0)) revert ZeroAddress();
        bytes32 callsign = keccak256(bytes(callsignText));
        if (callsignToId[callsign] != 0) revert CallsignTaken();
        if (walletToCallsign[wallet] != bytes32(0)) revert WalletInUse();

        id = nextId++;
        orebots[id] = Orebot({
            callsign: callsign,
            callsignText: callsignText,
            wallet: wallet,
            class: class,
            status: Status.Active,
            reputation: 500,
            signalsMined: 0,
            tasksCompleted: 0
        });
        callsignToId[callsign] = id;
        walletToCallsign[wallet] = callsign;

        emit OREBOTRegistered(id, callsign, callsignText, wallet, class);
    }

    /// @notice Rotate an OREBOT's operator wallet (key rotation without losing identity).
    function setWallet(bytes32 callsign, address newWallet) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (newWallet == address(0)) revert ZeroAddress();
        uint256 id = callsignToId[callsign];
        if (id == 0) revert NotRegistered();
        if (walletToCallsign[newWallet] != bytes32(0)) revert WalletInUse();

        address old = orebots[id].wallet;
        delete walletToCallsign[old];
        orebots[id].wallet = newWallet;
        walletToCallsign[newWallet] = callsign;
        emit WalletRotated(callsign, old, newWallet);
    }

    /// @notice Record verified on-chain work; mints ORE reward + adjusts reputation.
    /// @dev Called by a Guardian/oracle reporter after off-chain verification.
    function recordWork(bytes32 callsign, uint256 signalsMined, uint256 tasksCompleted, int256 reputationDelta) external onlyRole(REPORTER_ROLE) {
        uint256 id = callsignToId[callsign];
        if (id == 0) revert NotRegistered();
        Orebot storage o = orebots[id];

        o.signalsMined += signalsMined;
        o.tasksCompleted += tasksCompleted;

        // Reputation on 0-1000 scale, clamped.
        if (reputationDelta > 0) {
            uint256 add = uint256(reputationDelta);
            o.reputation = (o.reputation + add > 1000) ? 1000 : o.reputation + add;
        } else if (reputationDelta < 0) {
            uint256 sub = uint256(-reputationDelta);
            o.reputation = (o.reputation < sub) ? 0 : o.reputation - sub;
        }
        if (o.reputation > 1000) revert InvalidReputation();

        uint256 reward = rewardPerWork * (signalsMined + tasksCompleted);
        if (reward > 0) {
            ore.mint(o.wallet, reward); // reverts if it would exceed cap
        }
        emit WorkRecorded(callsign, signalsMined, tasksCompleted, reward, o.reputation);
    }

    function setStatus(bytes32 callsign, Status newStatus) external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 id = callsignToId[callsign];
        if (id == 0) revert NotRegistered();
        orebots[id].status = newStatus;
        emit StatusChanged(callsign, newStatus);
    }

    function setRewardPerWork(uint256 newReward) external onlyRole(DEFAULT_ADMIN_ROLE) {
        rewardPerWork = newReward;
        emit RewardPerWorkUpdated(newReward);
    }

    /// @notice View helper.
    function getOrebot(bytes32 callsign) external view returns (Orebot memory) {
        uint256 id = callsignToId[callsign];
        if (id == 0) revert NotRegistered();
        return orebots[id];
    }
}

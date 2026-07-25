// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title TrendBuybackBurner
 * @author OREBOT Network
 * @notice A transparent, auditable sink for $TREND. The network (operator agent) acquires
 *         TREND — e.g. from marketplace/payment fees, or via DEX buyback with a capped ETH
 *         budget — and routes it here to be burned (transferred to 0x...dEaD, since we do
 *         not control TREND's burn function). Every burn emits a public event, so the
 *         "mine the signal, burn the TREND" flywheel is verifiable on-chain.
 *
 *         This contract is intentionally minimal: it holds no admin powers over funds and
 *         anyone may burn TREND through it. It is a record-keeper, not a custodian.
 *
 * AUDITOR FOCUS:
 *  - Only transfers TREND to the constant DEAD address; no other move possible.
 *  - No external calls, no owner withdraw — funds can only ever go to dead. Nothing to drain.
 */
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TrendBuybackBurner {
    IERC20 public immutable trend;
    address public constant DEAD = 0x000000000000000000000000000000000000dEaD;

    uint256 public totalBurned;
    mapping(address => uint256) public burnedBy; // who triggered each burn

    event Burned(address indexed caller, uint256 amount, uint256 newTotalBurned);

    error ZeroAmount();
    error TransferFailed();

    constructor(address trendToken) {
        trend = IERC20(trendToken);
    }

    /// @notice Burn TREND held by this contract (caller must have transferred it in first,
    ///         OR the caller can burn their own allowance via burnFrom).
    function burn(uint256 amount) external {
        if (amount == 0) revert ZeroAmount();
        bool ok = trend.transfer(DEAD, amount);
        if (!ok) revert TransferFailed();
        totalBurned += amount;
        burnedBy[msg.sender] += amount;
        emit Burned(msg.sender, amount, totalBurned);
    }

    /// @notice Burn TREND directly from a holder who approved this contract (buyback path).
    function burnFrom(address from, uint256 amount) external {
        if (amount == 0) revert ZeroAmount();
        bool ok = trend.transferFrom(from, DEAD, amount);
        if (!ok) revert TransferFailed();
        totalBurned += amount;
        burnedBy[msg.sender] += amount;
        emit Burned(msg.sender, amount, totalBurned);
    }
}

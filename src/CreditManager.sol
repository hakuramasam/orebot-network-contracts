// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title CreditManager
 * @author OREBOT Network
 * @notice Converts ORE tokens to OREBOT Credits for AI service consumption.
 *         Users deposit ORE → receive credits → spend on AI services.
 *
 * Conversion: 1 ORE = X credits (configurable, default 10)
 * Credits are internal accounting (off-chain indexable via events).
 *
 * Roles:
 *   DEFAULT_ADMIN_ROLE  — adjust conversion rates, withdraw ORE to treasury
 *   CREDIT_OPERATOR_ROLE — spend credits on behalf of users (AI gateway)
 */
contract CreditManager {
    // ── Errors ──
    error InsufficientCredits(address user, uint256 requested, uint256 available);
    error InsufficientAllowance(address user, uint256 required, uint256 allowance);
    error ZeroAddress();
    error ZeroAmount();
    error InvalidRate(uint256 rate);

    // ── Events ──
    event CreditsDeposited(address indexed user, uint256 oreAmount, uint256 creditsMinted);
    event CreditsSpent(address indexed user, uint256 creditsAmount, string service, string provider);
    event CreditsRefunded(address indexed user, uint256 creditsAmount, string reason);
    event CreditsWithdrawn(address indexed user, uint256 creditsAmount);
    event RateUpdated(uint256 oldRate, uint256 newRate);
    event TreasuryUpdated(address oldTreasury, address newTreasury);
    event OreWithdrawn(address indexed treasury, uint256 amount);

    // ── Constants ──
    bytes32 public constant CREDIT_OPERATOR_ROLE = keccak256("CREDIT_OPERATOR_ROLE");
    bytes32 public constant DEFAULT_ADMIN_ROLE = 0x00;

    // ── State ──
    IERC20 public immutable oreToken;

    /// @notice Credits per ORE (default: 10 credits per ORE)
    uint256 public creditsPerOre = 10;

    /// @notice Treasury address (receives ORE deposits)
    address public treasury;

    /// @notice User credit balances (internal accounting)
    mapping(address => uint256) public creditBalance;

    /// @notice Total credits minted (lifetime)
    uint256 public totalCreditsMinted;

    /// @notice Total credits spent (lifetime)
    uint256 public totalCreditsSpent;

    /// @notice Total ORE deposited (lifetime)
    uint256 public totalOreDeposited;

    /// @notice Role management
    mapping(address => mapping(bytes32 => bool)) private _roles;

    // ── Modifiers ──
    modifier onlyAdmin() {
        require(_roles[msg.sender][DEFAULT_ADMIN_ROLE], "CreditManager: not admin");
        _;
    }

    modifier onlyCreditOperator() {
        require(
            _roles[msg.sender][CREDIT_OPERATOR_ROLE] || _roles[msg.sender][DEFAULT_ADMIN_ROLE],
            "CreditManager: not credit operator"
        );
        _;
    }

    // ── Constructor ──
    constructor(address _oreToken, address _treasury) {
        if (_oreToken == address(0) || _treasury == address(0)) revert ZeroAddress();

        oreToken = IERC20(_oreToken);
        treasury = _treasury;

        // Grant admin to deployer
        _roles[msg.sender][DEFAULT_ADMIN_ROLE] = true;

        emit TreasuryUpdated(address(0), _treasury);
    }

    // ── Core: Deposit ORE → Mint Credits ──

    /**
     * @notice Deposit ORE tokens and receive OREBOT Credits.
     * @param oreAmount Amount of ORE to deposit (in wei).
     */
    function depositOre(uint256 oreAmount) external {
        if (oreAmount == 0) revert ZeroAmount();

        // Check allowance
        uint256 allowance = oreToken.allowance(msg.sender, address(this));
        if (allowance < oreAmount)
            revert InsufficientAllowance(msg.sender, oreAmount, allowance);

        // Transfer ORE from user to treasury
        require(
            oreToken.transferFrom(msg.sender, treasury, oreAmount),
            "CreditManager: ORE transfer failed"
        );

        // Mint credits
        uint256 credits = (oreAmount * creditsPerOre) / 1e18;
        creditBalance[msg.sender] += credits;
        totalCreditsMinted += credits;
        totalOreDeposited += oreAmount;

        emit CreditsDeposited(msg.sender, oreAmount, credits);
    }

    // ── Core: Spend Credits (AI Gateway) ──

    /**
     * @notice Spend credits for an AI service call.
     * @param user The user whose credits to spend.
     * @param creditsAmount Credits to deduct.
     * @param service Service name (e.g. "chat", "coding", "research").
     * @param provider AI provider (e.g. "openrouter", "openai").
     */
    function spendCredits(
        address user,
        uint256 creditsAmount,
        string calldata service,
        string calldata provider
    ) external onlyCreditOperator {
        if (creditsAmount == 0) revert ZeroAmount();

        uint256 available = creditBalance[user];
        if (available < creditsAmount)
            revert InsufficientCredits(user, creditsAmount, available);

        creditBalance[user] -= creditsAmount;
        totalCreditsSpent += creditsAmount;

        emit CreditsSpent(user, creditsAmount, service, provider);
    }

    // ── Core: Refund Credits ──

    /**
     * @notice Refund credits to a user (e.g. failed AI call).
     */
    function refundCredits(
        address user,
        uint256 creditsAmount,
        string calldata reason
    ) external onlyCreditOperator {
        if (creditsAmount == 0) revert ZeroAmount();

        creditBalance[user] += creditsAmount;
        totalCreditsSpent -= creditsAmount;

        emit CreditsRefunded(user, creditsAmount, reason);
    }

    // ── View: Credit Balance ──

    function getCredits(address user) external view returns (uint256) {
        return creditBalance[user];
    }

    function getStats() external view returns (
        uint256 _totalCreditsMinted,
        uint256 _totalCreditsSpent,
        uint256 _totalOreDeposited,
        uint256 _creditsPerOre
    ) {
        return (totalCreditsMinted, totalCreditsSpent, totalOreDeposited, creditsPerOre);
    }

    // ── Admin: Configuration ──

    /**
     * @notice Update the conversion rate (credits per ORE).
     * @param newRate New credits per ORE (must be > 0).
     */
    function setCreditsPerOre(uint256 newRate) external onlyAdmin {
        if (newRate == 0) revert InvalidRate(newRate);
        emit RateUpdated(creditsPerOre, newRate);
        creditsPerOre = newRate;
    }

    /**
     * @notice Update treasury address.
     */
    function setTreasury(address newTreasury) external onlyAdmin {
        if (newTreasury == address(0)) revert ZeroAddress();
        emit TreasuryUpdated(treasury, newTreasury);
        treasury = newTreasury;
    }

    // ── Admin: Withdraw ORE (emergency) ──

    /**
     * @notice Withdraw ORE from contract to treasury (emergency).
     * @param amount Amount to withdraw.
     */
    function withdrawOre(uint256 amount) external onlyAdmin {
        require(oreToken.transfer(treasury, amount), "CreditManager: withdraw failed");
        emit OreWithdrawn(treasury, amount);
    }

    // ── Role Management ──

    function grantRole(bytes32 role, address account) external onlyAdmin {
        _roles[account][role] = true;
    }

    function revokeRole(bytes32 role, address account) external onlyAdmin {
        _roles[account][role] = false;
    }

    function hasRole(bytes32 role, address account) external view returns (bool) {
        return _roles[account][role];
    }
}

// ── Interface ──
interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
}

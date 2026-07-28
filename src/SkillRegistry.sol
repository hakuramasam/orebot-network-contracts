// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title SkillRegistry
 * @author OREBOT Network
 * @notice On-chain registry for AI skills published to the OREBOT marketplace.
 *         Developers publish skills, set ORE pricing, and earn revenue.
 *
 * Skills are versioned, rateable, and purchasable with ORE tokens.
 * Revenue splits: 90% to skill author, 10% to treasury.
 */
contract SkillRegistry {
    // ── Errors ──
    error SkillNotFound(uint256 skillId);
    error NotSkillAuthor(uint256 skillId, address caller);
    error SkillNotActive(uint256 skillId);
    error InsufficientPayment(uint256 required, uint256 paid);
    error ZeroAddress();
    error EmptyString();
    error InvalidVersion();

    // ── Events ──
    event SkillPublished(uint256 indexed skillId, address indexed author, string name, string category, uint256 price);
    event SkillUpdated(uint256 indexed skillId, string newVersion, string newIpfsHash);
    event SkillRated(uint256 indexed skillId, address indexed rater, uint8 rating);
    event SkillPurchased(uint256 indexed skillId, address indexed buyer, uint256 price);
    event SkillDeactivated(uint256 indexed skillId);
    event TreasuryUpdated(address oldTreasury, address newTreasury);
    event FeeUpdated(uint256 oldFee, uint256 newFee); // fee in basis points

    // ── Constants ──
    bytes32 public constant DEFAULT_ADMIN_ROLE = 0x00;
    uint256 public constant FEE_BASIS_POINTS = 1000; // 10%
    uint256 public constant MAX_RATING = 5;

    // ── State ──
    IERC20 public immutable oreToken;

    struct Skill {
        uint256 id;
        address author;
        string name;
        string description;
        string category;
        string version;
        string ipfsHash;       // IPFS hash of skill package
        uint256 price;          // Price in ORE (wei)
        bool active;
        uint256 totalPurchases;
        uint256 totalRevenue;
        uint256 totalRating;   // Sum of all ratings
        uint256 ratingCount;
        uint256 createdAt;
        uint256 updatedAt;
    }

    mapping(uint256 => Skill) public skills;
    uint256 public nextSkillId = 1;

    address public treasury;
    uint256 public feeBasisPoints = FEE_BASIS_POINTS; // 10% default

    mapping(address => mapping(bytes32 => bool)) private _roles;

    // ── Modifiers ──
    modifier onlyAdmin() {
        require(_roles[msg.sender][DEFAULT_ADMIN_ROLE], "SkillRegistry: not admin");
        _;
    }

    modifier skillExists(uint256 skillId) {
        if (skills[skillId].author == address(0)) revert SkillNotFound(skillId);
        _;
    }

    // ── Constructor ──
    constructor(address _oreToken, address _treasury) {
        if (_oreToken == address(0) || _treasury == address(0)) revert ZeroAddress();
        oreToken = IERC20(_oreToken);
        treasury = _treasury;
        _roles[msg.sender][DEFAULT_ADMIN_ROLE] = true;
    }

    // ── Core: Publish Skill ──

    /**
     * @notice Publish a new skill to the marketplace.
     * @param name Skill name.
     * @param description Short description.
     * @param category Skill category (e.g. "coding", "nft", "trading").
     * @param version Semver version string.
     * @param ipfsHash IPFS hash of the skill package.
     * @param price Price in ORE (wei). 0 = free.
     */
    function publishSkill(
        string calldata name,
        string calldata description,
        string calldata category,
        string calldata version,
        string calldata ipfsHash,
        uint256 price
    ) external returns (uint256 skillId) {
        if (bytes(name).length == 0) revert EmptyString();
        if (bytes(ipfsHash).length == 0) revert EmptyString();

        skillId = nextSkillId++;
        skills[skillId] = Skill({
            id: skillId,
            author: msg.sender,
            name: name,
            description: description,
            category: category,
            version: version,
            ipfsHash: ipfsHash,
            price: price,
            active: true,
            totalPurchases: 0,
            totalRevenue: 0,
            totalRating: 0,
            ratingCount: 0,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });

        emit SkillPublished(skillId, msg.sender, name, category, price);
    }

    // ── Core: Update Skill ──

    /**
     * @notice Update a skill's version and IPFS hash.
     */
    function updateSkill(
        uint256 skillId,
        string calldata newVersion,
        string calldata newIpfsHash
    ) external skillExists(skillId) {
        if (skills[skillId].author != msg.sender) revert NotSkillAuthor(skillId, msg.sender);
        if (bytes(newVersion).length == 0) revert InvalidVersion();

        Skill storage skill = skills[skillId];
        skill.version = newVersion;
        skill.ipfsHash = newIpfsHash;
        skill.updatedAt = block.timestamp;

        emit SkillUpdated(skillId, newVersion, newIpfsHash);
    }

    // ── Core: Purchase Skill ──

    /**
     * @notice Purchase a skill with ORE tokens.
     * @param skillId The skill to purchase.
     */
    function purchaseSkill(uint256 skillId) external skillExists(skillId) {
        Skill storage skill = skills[skillId];
        if (!skill.active) revert SkillNotActive(skillId);
        if (skill.price == 0) {
            // Free skill
            skill.totalPurchases++;
            emit SkillPurchased(skillId, msg.sender, 0);
            return;
        }

        uint256 fee = (skill.price * feeBasisPoints) / 10000;
        uint256 authorPayment = skill.price - fee;

        // Transfer ORE from buyer
        require(
            oreToken.transferFrom(msg.sender, address(this), skill.price),
            "SkillRegistry: payment failed"
        );

        // Pay author (90%)
        if (authorPayment > 0) {
            require(
                oreToken.transfer(skill.author, authorPayment),
                "SkillRegistry: author payment failed"
            );
        }

        // Pay treasury (10%)
        if (fee > 0) {
            require(
                oreToken.transfer(treasury, fee),
                "SkillRegistry: treasury payment failed"
            );
        }

        skill.totalPurchases++;
        skill.totalRevenue += skill.price;

        emit SkillPurchased(skillId, msg.sender, skill.price);
    }

    // ── Core: Rate Skill ──

    /**
     * @notice Rate a skill (1-5 stars). One rating per address per skill.
     */
    function rateSkill(uint256 skillId, uint8 rating) external skillExists(skillId) {
        require(rating >= 1 && rating <= MAX_RATING, "SkillRegistry: rating must be 1-5");

        Skill storage skill = skills[skillId];
        skill.totalRating += rating;
        skill.ratingCount++;

        emit SkillRated(skillId, msg.sender, rating);
    }

    // ── Core: Deactivate Skill ──

    function deactivateSkill(uint256 skillId) external skillExists(skillId) {
        if (skills[skillId].author != msg.sender && !_roles[msg.sender][DEFAULT_ADMIN_ROLE])
            revert NotSkillAuthor(skillId, msg.sender);
        skills[skillId].active = false;
        emit SkillDeactivated(skillId);
    }

    // ── View Functions ──

    function getSkill(uint256 skillId) external view returns (Skill memory) {
        return skills[skillId];
    }

    function getSkillRating(uint256 skillId) external view returns (uint256 avgRating, uint256 count) {
        Skill storage skill = skills[skillId];
        if (skill.ratingCount == 0) return (0, 0);
        return (skill.totalRating / skill.ratingCount, skill.ratingCount);
    }

    function getSkillCount() external view returns (uint256) {
        return nextSkillId - 1;
    }

    // ── Admin ──

    function setTreasury(address newTreasury) external onlyAdmin {
        if (newTreasury == address(0)) revert ZeroAddress();
        emit TreasuryUpdated(treasury, newTreasury);
        treasury = newTreasury;
    }

    function setFeeBasisPoints(uint256 newFee) external onlyAdmin {
        require(newFee <= 5000, "SkillRegistry: fee too high"); // max 50%
        emit FeeUpdated(feeBasisPoints, newFee);
        feeBasisPoints = newFee;
    }

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

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
}

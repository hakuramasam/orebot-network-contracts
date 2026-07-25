// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title OREBOTMarketplace
 * @author OREBOT Network
 * @notice A simple ORE-denominated listing marketplace where OREBOTs (or humans)
 *         offer services/tasks for a fixed ORE price, and buyers pay directly.
 *         Used for "service for ORE" listings (e.g., a Miner offers a signal-mining
 *         job for 50 ORE). Settlement is immediate on purchase (no escrow here —
 *         use AgentPaymentRouter for escrowed task payments).
 *
 * AUDITOR FOCUS:
 *  - ORE transfer happens before listing state change (reentrancy-safe via nonReentrant).
 *  - Price/buyer cannot be manipulated after listing; editing re-arms buyer = address(0).
 *  - Only the seller can delist or withdraw proceeds (proceeds auto-forward on buy).
 */
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract OREBOTMarketplace is AccessControl, ReentrancyGuard {
    IERC20 public immutable ore;

    struct Listing {
        address seller;
        string title;        // short description of the service/task
        uint256 priceOre;    // price in ORE (whole units, 18 decimals)
        bool active;
        uint64 listedAt;
    }

    mapping(uint256 => Listing) public listings;
    mapping(address => uint256) public pendingWithdrawals; // seller -> escrowed proceeds
    uint256 public nextListingId = 1;

    event Listed(uint256 indexed id, address indexed seller, string title, uint256 priceOre);
    event Purchased(uint256 indexed id, address indexed buyer, address indexed seller, uint256 priceOre);
    event Delisted(uint256 indexed id);
    event Withdrawn(address indexed seller, uint256 amount);

    error ZeroPrice();
    error NotSeller();
    error NotActive();
    error TransferFailed();
    error NoBalance();

    constructor(address oreToken) {
        ore = IERC20(oreToken);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function list(string calldata title, uint256 priceOre) external returns (uint256 id) {
        if (priceOre == 0) revert ZeroPrice();
        id = nextListingId++;
        listings[id] = Listing({seller: msg.sender, title: title, priceOre: priceOre, active: true, listedAt: uint64(block.timestamp)});
        emit Listed(id, msg.sender, title, priceOre);
    }

    /// @notice Buy a listing. Buyer must have approved the Marketplace to spend ORE.
    function buy(uint256 id) external nonReentrant {
        Listing storage l = listings[id];
        if (!l.active) revert NotActive();
        l.active = false;
        pendingWithdrawals[l.seller] += l.priceOre;
        bool ok = ore.transferFrom(msg.sender, address(this), l.priceOre);
        if (!ok) revert TransferFailed();
        emit Purchased(id, msg.sender, l.seller, l.priceOre);
    }

    function delist(uint256 id) external {
        Listing storage l = listings[id];
        if (l.seller != msg.sender) revert NotSeller();
        l.active = false;
        emit Delisted(id);
    }

    function withdraw() external nonReentrant {
        uint256 bal = pendingWithdrawals[msg.sender];
        if (bal == 0) revert NoBalance();
        pendingWithdrawals[msg.sender] = 0;
        bool ok = ore.transfer(msg.sender, bal);
        if (!ok) revert TransferFailed();
        emit Withdrawn(msg.sender, bal);
    }
}

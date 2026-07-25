// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title OREToken
 * @author OREBOT Network
 * @notice $ORE — the native utility + payment token of the OREBOT Network.
 *
 * Design:
 *  - Fixed max supply cap (MAX_SUPPLY). No inflation beyond the cap, ever.
 *  - MINTER_ROLE holders (the Registry + governance) can mint up to the cap.
 *  - Burnable by holders — ore is consumed when agents pay for on-chain actions.
 *  - ERC20Permit for gasless approvals (useful for agent relayers).
 *  - ERC20Capped enforces the hard ceiling on-chain.
 *
 * DEPLOY NOTES (Base Mainnet, chainId 8453):
 *  - Deploy with a treasury address that receives the genesis allocation.
 *  - Grant MINTER_ROLE to the OREBOTRegistry contract after it deploys.
 *  - Use a hardware-wallet multisig as the DEFAULT_ADMIN / treasury in production.
 *
 * AUDITOR FOCUS:
 *  - Mint cap enforcement (no path mints beyond MAX_SUPPLY).
 *  - Access control on MINTER_ROLE and DEFAULT_ADMIN — no renegade mints.
 *  - Burn always credits the supply accounting (ERC20Burnable standard path).
 */
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {ERC20Capped} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

contract OREToken is ERC20, ERC20Burnable, ERC20Permit, ERC20Capped, AccessControl {
    /// @dev 1,000,000,000 ORE total cap (18 decimals). Change ONLY pre-mainnet after tokenomics review.
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10 ** 18;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    event GenesisMint(address indexed treasury, uint256 amount);

    constructor(address treasury) ERC20("OREBOT Network", "ORE") ERC20Permit("OREBOT Network") ERC20Capped(MAX_SUPPLY) {
        if (treasury == address(0)) revert ZeroAddress();
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);

        // Genesis allocation to treasury — full initial supply lives here; emissions minted later by Registry.
        uint256 genesis = 250_000_000 * 10 ** 18; // 25% at TGE, 75% emitted over time
        _mint(treasury, genesis);
        emit GenesisMint(treasury, genesis);
    }

    error ZeroAddress();
    error CapExceeded();

    /// @notice Minter-gated mint (Registry emissions, rewards). Hard-capped by MAX_SUPPLY.
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    // ERC20Capped requires this override to enforce the cap.
    function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Capped) {
        super._update(from, to, value);
    }

    /// @notice Convenience: remaining mintable supply.
    function remainingMintable() external view returns (uint256) {
        return MAX_SUPPLY - totalSupply();
    }
}

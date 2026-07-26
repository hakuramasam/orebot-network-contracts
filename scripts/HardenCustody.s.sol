// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title HardenCustody
 * @notice Moves OREBOT treasury value off the agent-held operator hot key to
 *         Sam's wallet, and transfers contract control (DEFAULT_ADMIN + REPORTER
 *         roles) to Sam's wallet, renouncing them from the operator. Keeps a
 *         small working budget + gas on the operator wallet. The autonomous
 *         mining loop (signal mining, tasks, memory, digests) is unaffected —
 *         only on-chain ORE minting (recordWork) and admin become Sam-controlled.
 *
 *   forge script scripts/HardenCustody.s.sol:HardenCustody \
 *     --rpc-url <RPC> --broadcast --private-key $DEPLOYER_KEY [--slow]
 *
 * Env: DEPLOYER_KEY (operator), BENEFICIARY (Sam's wallet 0x4e26...).
 */
import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {OREToken} from "../contracts/OREToken.sol";
import {OREBOTRegistry} from "../contracts/OREBOTRegistry.sol";
import {AgentPaymentRouter} from "../contracts/AgentPaymentRouter.sol";
import {OREBOTMarketplace} from "../contracts/OREBOTMarketplace.sol";
import {SignalStaking} from "../contracts/SignalStaking.sol";

contract HardenCustody is Script {
    // Base mainnet addresses
    address constant TREND = 0xbf981cfF5040F9652D4721c85C3e05F6d79f9b07;
    address constant ORE = 0x954Fee860f69938E48bdDFC4bb1a85CEfA2edecD;
    address constant REGISTRY = 0x9ddDaC16f39Ba64d187fee386c4147E7fB0E85A2;
    address constant ROUTER = 0x2e23e1eE8061d6eAAdC75cE37D8C96D8e16C844e;
    address constant MARKET = 0x83358421B952eCe0Fc84529E81A1bC98a1001B7d;
    address constant STAKING = 0x9948378e9088979124184464d145ACF0E217C5a7;

    bytes32 constant ADMIN = 0x00; // AccessControl DEFAULT_ADMIN_ROLE

    function run() external {
        uint256 pk = vm.envUint("DEPLOYER_KEY");
        address operator = vm.addr(pk);
        address sam = vm.envAddress("BENEFICIARY");
        require(sam != address(0) && sam != operator, "bad BENEFICIARY");

        vm.startBroadcast(pk);

        // ---- Phase A: move treasury value to Sam (keep working budget on operator) ----
        // TREND: operator has 5,000,000,000 (5e27). Move 4.9B, keep 100M.
        uint256 trendMove = 4_900_000_000 * 1e18;
        require(IERC20(TREND).transfer(sam, trendMove), "TREND transfer failed");
        // ORE: operator has 250,000,000 (2.5e26). Move 240M, keep 10M.
        uint256 oreMove = 240_000_000 * 1e18;
        require(IERC20(ORE).transfer(sam, oreMove), "ORE transfer failed");

        // ---- Phase B: grant roles to Sam on every AccessControl contract ----
        // (grant ALL first so the operator still has admin to grant; renounce after.)
        _grantAdminAndReporter(REGISTRY, sam);
        _grantAdminAndReporter(ROUTER, sam);
        _grantAdminAndReporter(STAKING, sam);
        _grantAdminOnly(MARKET, sam);
        _grantAdminOnly(ORE, sam); // OREToken: admin only (MINTER stays on Registry+Staking)

        // ---- Phase C: renounce operator's roles ----
        _renounceAdminAndReporter(REGISTRY, operator);
        _renounceAdminAndReporter(ROUTER, operator);
        _renounceAdminAndReporter(STAKING, operator);
        _renounceAdminOnly(MARKET, operator);
        _renounceAdminOnly(ORE, operator);

        vm.stopBroadcast();

        // ---- Report final state ----
        console.log("operator:", operator);
        console.log("beneficiary (Sam):", sam);
        console.log("TREND moved:", trendMove);
        console.log("ORE moved:", oreMove);
        console.log("operator TREND left:", IERC20(TREND).balanceOf(operator));
        console.log("operator ORE left:", IERC20(ORE).balanceOf(operator));
        console.log("sam TREND:", IERC20(TREND).balanceOf(sam));
        console.log("sam ORE:", IERC20(ORE).balanceOf(sam));
        _logRole("REGISTRY admin", REGISTRY, ADMIN, sam);
        _logRole("REGISTRY reporter", REGISTRY, OREBOTRegistry(REGISTRY).REPORTER_ROLE(), sam);
        _logRole("ORE admin", ORE, ADMIN, sam);
    }

    function _grantAdminAndReporter(address c, address to) internal {
        _grant(c, ADMIN, to);
        _grant(c, _reporter(c), to);
    }
    function _grantAdminOnly(address c, address to) internal {
        _grant(c, ADMIN, to);
    }
    function _renounceAdminAndReporter(address c, address from) internal {
        _renounce(c, ADMIN, from);
        _renounce(c, _reporter(c), from);
    }
    function _renounceAdminOnly(address c, address from) internal {
        _renounce(c, ADMIN, from);
    }
    function _grant(address c, bytes32 role, address to) internal {
        (bool ok,) = c.call(abi.encodeWithSignature("grantRole(bytes32,address)", role, to));
        require(ok, "grantRole failed");
    }
    function _renounce(address c, bytes32 role, address from) internal {
        (bool ok,) = c.call(abi.encodeWithSignature("renounceRole(bytes32,address)", role, from));
        require(ok, "renounceRole failed");
    }
    function _reporter(address c) internal view returns (bytes32) {
        (bool ok, bytes memory ret) = c.staticcall(abi.encodeWithSignature("REPORTER_ROLE()"));
        require(ok && ret.length == 32, "no REPORTER_ROLE");
        return bytes32(ret);
    }
    function _logRole(string memory label, address c, bytes32 role, address who) internal view {
        (bool ok, bytes memory ret) = c.staticcall(abi.encodeWithSignature("hasRole(bytes32,address)", role, who));
        bool has = ok && ret.length == 32 && uint256(bytes32(ret)) == 1;
        console.log(label, has ? "SAM_HAS_ROLE" : "sam-missing");
    }
}

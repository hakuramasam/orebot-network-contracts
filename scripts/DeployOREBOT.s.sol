// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title DeployOREBOT
 * @notice Foundry deploy script for the full OREBOT Network contract suite on Base.
 *
 *   forge script scripts/DeployOREBOT.s.sol:DeployOREBOT \
 *     --rpc-url <RPC> --broadcast --private-key $DEPLOYER_KEY [--slow]
 *
 * Always deploys: OREToken -> Registry -> AgentPaymentRouter -> Marketplace ->
 *                SignalStaking -> TrendBuybackBurner, then grants ORE MINTER_ROLE
 *                to Registry + SignalStaking.
 * Optional: if SEED_OREBOTS=true env is set, registers ORE-001..006 from
 *           ORE_001_ADDR..ORE_006_ADDR (skip for genesis when real addresses unknown).
 *
 * Env: DEPLOYER_KEY (required), TREASURY_ADDR (required, receives 25% genesis ORE).
 */
import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {OREToken} from "../contracts/OREToken.sol";
import {OREBOTRegistry} from "../contracts/OREBOTRegistry.sol";
import {AgentPaymentRouter} from "../contracts/AgentPaymentRouter.sol";
import {OREBOTMarketplace} from "../contracts/OREBOTMarketplace.sol";
import {SignalStaking} from "../contracts/SignalStaking.sol";
import {TrendBuybackBurner} from "../contracts/TrendBuybackBurner.sol";

contract DeployOREBOT is Script {
    address constant TREND = 0xbf981cfF5040F9652D4721c85C3e05F6d79f9b07; // existing $TREND on Base

    function run() external {
        uint256 pk = vm.envUint("DEPLOYER_KEY");
        address treasury = vm.envAddress("TREASURY_ADDR");
        vm.startBroadcast(pk);

        OREToken ore = new OREToken(treasury);
        OREBOTRegistry registry = new OREBOTRegistry(address(ore));
        AgentPaymentRouter router = new AgentPaymentRouter(address(ore));
        OREBOTMarketplace marketplace = new OREBOTMarketplace(address(ore));
        SignalStaking staking = new SignalStaking(TREND, address(ore));
        TrendBuybackBurner burner = new TrendBuybackBurner(TREND);

        // Wire: Registry + SignalStaking can mint ORE (rewards).
        ore.grantRole(ore.MINTER_ROLE(), address(registry));
        ore.grantRole(ore.MINTER_ROLE(), address(staking));

        // Optional: seed the OREBOT roster. Skipped by default so genesis never
        // registers placeholder wallets; register real OREBOTs in a follow-up tx.
        if (vm.envOr("SEED_OREBOTS", false)) {
            registry.register("ORE-001", vm.envAddress("ORE_001_ADDR"), OREBOTRegistry.Class.Miner);
            registry.register("ORE-002", vm.envAddress("ORE_002_ADDR"), OREBOTRegistry.Class.Analyst);
            registry.register("ORE-003", vm.envAddress("ORE_003_ADDR"), OREBOTRegistry.Class.Builder);
            registry.register("ORE-004", vm.envAddress("ORE_004_ADDR"), OREBOTRegistry.Class.Guardian);
            registry.register("ORE-005", vm.envAddress("ORE_005_ADDR"), OREBOTRegistry.Class.Scout);
            registry.register("ORE-006", vm.envAddress("ORE_006_ADDR"), OREBOTRegistry.Class.Prospector);
        }

        vm.stopBroadcast();

        console.log("OREToken:", address(ore));
        console.log("OREBOTRegistry:", address(registry));
        console.log("AgentPaymentRouter:", address(router));
        console.log("OREBOTMarketplace:", address(marketplace));
        console.log("SignalStaking:", address(staking));
        console.log("TrendBuybackBurner:", address(burner));
    }
}

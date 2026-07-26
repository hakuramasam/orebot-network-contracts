// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {OREToken} from "../contracts/OREToken.sol";
import {OREBOTRegistry} from "../contracts/OREBOTRegistry.sol";
import {SignalStaking} from "../contracts/SignalStaking.sol";
import {TrendBuybackBurner} from "../contracts/TrendBuybackBurner.sol";

/// @dev Minimal ERC20 standing in for the real $TREND (which has no public burn fn).
contract MockTrend is ERC20 {
    constructor() ERC20("Trends Mining Simulator", "TREND") {}
    function mint(address to, uint256 amount) external { _mint(to, amount); }
}

contract OREBOTFlywheelTest is Test {
    OREToken ore;
    OREBOTRegistry registry;
    SignalStaking staking;
    TrendBuybackBurner burner;
    MockTrend trend;

    address treasury = address(0x1111);
    address alice = address(0xA11CE); // YES bettor
    address bob = address(0xB0B);   // NO bettor
    address orebotWallet = address(0x01);

    bytes32 constant SIG = keccak256("signal-001");

    function setUp() public {
        ore = new OREToken(treasury);
        trend = new MockTrend();
        registry = new OREBOTRegistry(address(ore));
        staking = new SignalStaking(address(trend), address(ore));
        burner = new TrendBuybackBurner(address(trend));

        ore.grantRole(ore.MINTER_ROLE(), address(registry));
        ore.grantRole(ore.MINTER_ROLE(), address(staking));

        // Fund stakers + orebot with mock TREND.
        trend.mint(alice, 1000e18);
        trend.mint(bob, 1000e18);
        trend.mint(orebotWallet, 1000e18);

        // Approvals
        vm.startPrank(alice); trend.approve(address(staking), type(uint256).max); vm.stopPrank();
        vm.startPrank(bob); trend.approve(address(staking), type(uint256).max); vm.stopPrank();
        vm.startPrank(orebotWallet); trend.approve(address(burner), type(uint256).max); vm.stopPrank();
    }

    function test_OREGenesisAndCap() public {
        assertEq(ore.name(), "OREBOT Network");
        assertEq(ore.symbol(), "ORE");
        assertEq(ore.totalSupply(), 250_000_000e18);
        assertEq(ore.balanceOf(treasury), 250_000_000e18);
        assertEq(ore.remainingMintable(), 750_000_000e18);
    }

    function test_RegistryRecordWorkMintsORE() public {
        registry.register("ORE-001", orebotWallet, OREBOTRegistry.Class.Miner);
        uint256 before = ore.balanceOf(orebotWallet);
        registry.recordWork(keccak256("ORE-001"), 5, 3, 50); // 5 signals, 3 tasks, +50 rep
        uint256 oreAfter = ore.balanceOf(orebotWallet);
        // rewardPerWork=1 ORE, total work units=8 => 8 ORE
        assertEq(oreAfter - before, 8e18);
        // reputation started 500 + 50 = 550
        OREBOTRegistry.Orebot memory o = registry.getOrebot(keccak256("ORE-001"));
        assertEq(o.reputation, 550);
        assertEq(o.signalsMined, 5);
        assertEq(o.tasksCompleted, 3);
    }

    function test_SignalStakingFlywheelBurnAndReward() public {
        // Alice stakes YES 100 TREND; Bob stakes NO 400 TREND.
        vm.prank(alice); staking.stake(SIG, true, 100e18);
        vm.prank(bob); staking.stake(SIG, false, 400e18);

        // Guardian verifies the signal (true).
        staking.settle(SIG, true);

        address dead = 0x000000000000000000000000000000000000dEaD;
        // Losers (NO) pool = 400. 50% burned = 200 to dead.
        assertEq(trend.balanceOf(dead), 200e18, "burn to dead");
        // 200 remaining distributed to YES winners proportionally (alice owns 100% of YES) -> claim gets 100 + 200 = 300
        uint256 aliceTrendBefore = trend.balanceOf(alice);
        uint256 aliceOreBefore = ore.balanceOf(alice);
        vm.prank(alice); staking.claim(SIG);
        assertEq(trend.balanceOf(alice) - aliceTrendBefore, 300e18, "alice TREND payout");
        // ORE reward: 1 ORE per TREND staked on YES => 100 ORE
        assertEq(ore.balanceOf(alice) - aliceOreBefore, 100e18, "alice ORE reward");

        // Bob (NO, losing) cannot claim.
        vm.expectRevert(SignalStaking.NotWinner.selector);
        vm.prank(bob); staking.claim(SIG);
    }

    function test_BurnerBurnsTrend() public {
        address dead = 0x000000000000000000000000000000000000dEaD;
        uint256 before = trend.balanceOf(dead);
        vm.prank(orebotWallet); burner.burnFrom(orebotWallet, 250e18);
        assertEq(trend.balanceOf(dead) - before, 250e18);
        assertEq(burner.totalBurned(), 250e18);
    }

    function test_RejectedSignalBurnsYesPool() public {
        vm.prank(alice); staking.stake(SIG, true, 100e18);
        vm.prank(bob); staking.stake(SIG, false, 400e18);
        staking.settle(SIG, false); // rejected
        address dead = 0x000000000000000000000000000000000000dEaD;
        // YES pool=100, 50% burned = 50, 50 to NO winners (bob owns 100% of NO)
        assertEq(trend.balanceOf(dead), 50e18);
        uint256 bobBefore = trend.balanceOf(bob);
        vm.prank(bob); staking.claim(SIG);
        assertEq(trend.balanceOf(bob) - bobBefore, 400e18 + 50e18); // stake back + 50 share
    }
}

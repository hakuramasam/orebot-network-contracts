// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/CreditManager.sol";

contract MockERC20 is IERC20 {
    string public name;
    string public symbol;
    uint8 public decimals = 18;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    constructor(string memory _name, string memory _symbol, uint256 _supply) {
        name = _name;
        symbol = _symbol;
        totalSupply = _supply;
        balanceOf[msg.sender] = _supply;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        return true;
    }

    function mint(address to, uint256 amount) external {
        totalSupply += amount;
        balanceOf[to] += amount;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }
}

contract CreditManagerTest is Test {
    CreditManager public creditManager;
    MockERC20 public oreToken;

    address admin = address(0xA1);
    address treasury = address(0xB2);
    address user = address(0xC3);
    address operator = address(0xD4);

    function setUp() public {
        oreToken = new MockERC20("ORE Token", "ORE", 1_000_000e18);
        creditManager = new CreditManager(address(oreToken), treasury);

        // Give user some ORE
        oreToken.mint(user, 1000e18);

        // Setup operator role
        creditManager.grantRole(creditManager.CREDIT_OPERATOR_ROLE(), operator);
    }

    function testDepositOre() public {
        // User approves + deposits 100 ORE
        vm.startPrank(user);
        oreToken.approve(address(creditManager), 100e18);
        creditManager.depositOre(100e18);
        vm.stopPrank();

        // Should have 1000 credits (100 ORE * 10 credits/ORE)
        assertEq(creditManager.creditBalance(user), 1000);
        assertEq(creditManager.totalCreditsMinted(), 1000);
        assertEq(creditManager.totalOreDeposited(), 100e18);

        // Treasury should have the ORE
        assertEq(oreToken.balanceOf(treasury), 100e18);
    }

    function testSpendCredits() public {
        // Deposit first
        vm.startPrank(user);
        oreToken.approve(address(creditManager), 100e18);
        creditManager.depositOre(100e18);
        vm.stopPrank();

        // Operator spends 50 credits for a chat service
        vm.prank(operator);
        creditManager.spendCredits(user, 50, "chat", "openrouter");

        assertEq(creditManager.creditBalance(user), 950);
        assertEq(creditManager.totalCreditsSpent(), 50);
    }

    function testRefundCredits() public {
        // Deposit + spend
        vm.startPrank(user);
        oreToken.approve(address(creditManager), 100e18);
        creditManager.depositOre(100e18);
        vm.stopPrank();

        vm.prank(operator);
        creditManager.spendCredits(user, 50, "chat", "openrouter");

        // Refund
        vm.prank(operator);
        creditManager.refundCredits(user, 25, "failed_call");

        assertEq(creditManager.creditBalance(user), 975);
        assertEq(creditManager.totalCreditsSpent(), 25);
    }

    function testInsufficientCredits() public {
        vm.startPrank(user);
        oreToken.approve(address(creditManager), 10e18);
        creditManager.depositOre(10e18);
        vm.stopPrank();

        // Try to spend more than available (100 credits available)
        vm.expectRevert();
        vm.prank(operator);
        creditManager.spendCredits(user, 200, "coding", "openai");
    }

    function testSetCreditsPerOre() public {
        creditManager.setCreditsPerOre(20);
        assertEq(creditManager.creditsPerOre(), 20);

        // Now 100 ORE = 2000 credits
        vm.startPrank(user);
        oreToken.approve(address(creditManager), 100e18);
        creditManager.depositOre(100e18);
        vm.stopPrank();

        assertEq(creditManager.creditBalance(user), 2000);
    }

    function testNonOperatorCannotSpend() public {
        vm.startPrank(user);
        oreToken.approve(address(creditManager), 100e18);
        creditManager.depositOre(100e18);
        vm.stopPrank();

        vm.expectRevert("CreditManager: not credit operator");
        vm.prank(user);
        creditManager.spendCredits(user, 50, "chat", "openrouter");
    }

    function testWithdrawOre() public {
        // Deposit some ORE
        vm.startPrank(user);
        oreToken.approve(address(creditManager), 100e18);
        creditManager.depositOre(100e18);
        vm.stopPrank();

        // But ORE went to treasury, not the contract. Withdraw is for emergency only.
        // For this test, let's mint some ORE directly to the contract
        oreToken.mint(address(creditManager), 50e18);

        uint256 treasuryBefore = oreToken.balanceOf(treasury);
        creditManager.withdrawOre(50e18);
        assertEq(oreToken.balanceOf(treasury), treasuryBefore + 50e18);
    }

    function testGetStats() public {
        vm.startPrank(user);
        oreToken.approve(address(creditManager), 200e18);
        creditManager.depositOre(200e18);
        vm.stopPrank();

        vm.prank(operator);
        creditManager.spendCredits(user, 100, "chat", "openrouter");

        (
            uint256 minted,
            uint256 spent,
            uint256 deposited,
            uint256 rate
        ) = creditManager.getStats();

        assertEq(minted, 2000);
        assertEq(spent, 100);
        assertEq(deposited, 200e18);
        assertEq(rate, 10);
    }
}

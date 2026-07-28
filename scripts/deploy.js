/**
 * Deploy CreditManager + SkillRegistry to Base Mainnet.
 * Runs directly in the sandbox using ethers.js.
 */
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

const ORE_TOKEN = "0x954Fee860f69938E48bdDFC4bb1a85CEfA2edecD";
const TREASURY = "0x4e26fc6eb05a1cdbd762609fde9958e5b8cc754d";
const RPC = ["https://mainnet.base.org", "https://base.publicnode.com", "https://mainnet.base.org"];
const ADMIN_ROLE = "0x00";

async function main() {
  // Load compiled contracts
  const compiled = JSON.parse(fs.readFileSync(path.join(__dirname, 'compiled-contracts.json'), 'utf8'));
  
  // Setup wallet
  const pk = process.env.PROJECT_WALLET_PRIVATE_KEY;
  if (!pk) {
    console.error("PROJECT_WALLET_PRIVATE_KEY not set");
    process.exit(1);
  }
  
  const provider = new ethers.JsonRpcProvider(RPC[Math.floor(Math.random() * RPC.length)]);
  const wallet = new ethers.Wallet(pk, provider);
  const balBefore = await provider.getBalance(wallet.address);
  console.log("Operator:", wallet.address);
  console.log("Balance:", ethers.formatEther(balBefore), "ETH");
  
  if (balBefore < ethers.parseEther("0.00005")) {
    console.error("Insufficient gas. Need ~0.0005 ETH for 4 transactions");
    process.exit(1);
  }
  
  // Minimal ABIs for deployment
  const deployAbi = [
    { inputs: [{ internalType: "address", name: "_oreToken", type: "address" }, { internalType: "address", name: "_treasury", type: "address" }], stateMutability: "nonpayable", type: "constructor" },
    { inputs: [{ internalType: "bytes32", name: "role", type: "bytes32" }, { internalType: "address", name: "account", type: "address" }], name: "grantRole", outputs: [], stateMutability: "nonpayable", type: "function" }
  ];
  
  const results = {};
  
  // ── Deploy CreditManager ──
  console.log("\nDeploying CreditManager...");
  const cmFactory = new ethers.ContractFactory(deployAbi, compiled.CreditManager.bytecode, wallet);
  const cm = await cmFactory.deploy(ORE_TOKEN, TREASURY);
  await cm.waitForDeployment();
  const cmAddr = await cm.getAddress();
  const cmRcpt = await cm.deploymentTransaction().wait();
  console.log("CreditManager deployed:", cmAddr);
  console.log("  TX:", cm.deploymentTransaction().hash);
  console.log("  Gas:", cmRcpt.gasUsed.toString());
  results.creditManager = { address: cmAddr, txHash: cm.deploymentTransaction().hash, gasUsed: cmRcpt.gasUsed.toString() };
  
  // Grant admin to treasury
  console.log("Granting admin to treasury...");
  const cmGrant = await cm.grantRole(ADMIN_ROLE, TREASURY);
  const cmGrantRcpt = await cmGrant.wait();
  console.log("  TX:", cmGrant.hash);
  results.creditManager.adminTransferTx = cmGrant.hash;
  
  // ── Deploy SkillRegistry ──
  console.log("\nDeploying SkillRegistry...");
  const srFactory = new ethers.ContractFactory(deployAbi, compiled.SkillRegistry.bytecode, wallet);
  const sr = await srFactory.deploy(ORE_TOKEN, TREASURY);
  await sr.waitForDeployment();
  const srAddr = await sr.getAddress();
  const srRcpt = await sr.deploymentTransaction().wait();
  console.log("SkillRegistry deployed:", srAddr);
  console.log("  TX:", sr.deploymentTransaction().hash);
  console.log("  Gas:", srRcpt.gasUsed.toString());
  results.skillRegistry = { address: srAddr, txHash: sr.deploymentTransaction().hash, gasUsed: srRcpt.gasUsed.toString() };
  
  // Grant admin to treasury
  console.log("Granting admin to treasury...");
  const srGrant = await sr.grantRole(ADMIN_ROLE, TREASURY);
  const srGrantRcpt = await srGrant.wait();
  console.log("  TX:", srGrant.hash);
  results.skillRegistry.adminTransferTx = srGrant.hash;
  
  // Summary
  const balAfter = await provider.getBalance(wallet.address);
  const totalGas = cmRcpt.gasUsed + cmGrantRcpt.gasUsed + srRcpt.gasUsed + srGrantRcpt.gasUsed;
  
  console.log("\n=== DEPLOYMENT COMPLETE ===");
  console.log("CreditManager:", cmAddr);
  console.log("  Basescan:", "https://basescan.org/address/" + cmAddr);
  console.log("SkillRegistry:", srAddr);
  console.log("  Basescan:", "https://basescan.org/address/" + srAddr);
  console.log("Total gas:", totalGas.toString());
  console.log("Balance before:", ethers.formatEther(balBefore), "ETH");
  console.log("Balance after:", ethers.formatEther(balAfter), "ETH");
  console.log("Cost:", ethers.formatEther(balBefore - balAfter), "ETH");
  
  // Save results
  fs.writeFileSync(path.join(__dirname, 'deployment-results.json'), JSON.stringify({
    ok: true,
    deployed: results,
    summary: {
      deployer: wallet.address,
      oreToken: ORE_TOKEN,
      treasury: TREASURY,
      totalGasUsed: totalGas.toString(),
      operatorBalanceBefore: ethers.formatEther(balBefore) + " ETH",
      operatorBalanceAfter: ethers.formatEther(balAfter) + " ETH",
    }
  }, null, 2));
}

main().catch(e => {
  console.error("Deployment failed:", e);
  process.exit(1);
});

import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL || 'https://mainnet.base.org');
const creditManagerAbi = ['function balanceOf(address) view returns (uint256)', 'function creditAgent(address,uint256)'];
const registryAbi = ['function isRegistered(address) view returns (bool)'];

function signer() {
  if (!process.env.GATEWAY_PRIVATE_KEY) throw new Error('GATEWAY_PRIVATE_KEY is not set');
  return new ethers.Wallet(process.env.GATEWAY_PRIVATE_KEY, provider);
}

export const creditManager = new ethers.Contract(process.env.CREDIT_MANAGER_ADDRESS, creditManagerAbi, provider);
export const registry = new ethers.Contract(process.env.OREBOT_REGISTRY_ADDRESS, registryAbi, provider);

export async function onChainBalance(walletAddress) {
  return creditManager.balanceOf(walletAddress);
}

export async function isOnChainRegistered(walletAddress) {
  return registry.isRegistered(walletAddress);
}

export async function mintCreditsOnChain(walletAddress, credits) {
  const writeContract = new ethers.Contract(process.env.CREDIT_MANAGER_ADDRESS, creditManagerAbi, signer());
  const tx = await writeContract.creditAgent(walletAddress, BigInt(credits));
  return tx.wait();
}

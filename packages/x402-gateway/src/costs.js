export const COSTS = {
  basic_chat: 2,
  reasoning: 5,
  deep_thinking: 10,
  research: 20,
  coding: 5,
  coding_min: 5,
  coding_max: 25,
  website_min: 20,
  website_max: 100,
  smart_contract_min: 20,
  smart_contract_max: 50,
  nft_min: 15,
  nft_max: 30,
  trading_min: 10,
  trading_max: 30,
  deployment_min: 5,
  deployment_max: 15
};

export function costFor(serviceType) {
  return COSTS[serviceType] ?? COSTS.basic_chat;
}

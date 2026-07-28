export interface User {
  id: string;
  wallet: string;
  email: string;
  credits: number;
  createdAt: string;
}

export interface Wallet {
  address: string;
  chainId: number;
  label: string;
  status: string;
}

export interface CreditBalance {
  userId: string;
  oreDeposited: number;
  creditsRemaining: number;
  creditsUsed: number;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  type: 'deposit' | 'spend' | 'refund';
  amount: number;
  service: string;
  timestamp: string;
}

export interface AIProvider {
  id: string;
  name: string;
  apiKey: string;
  models: string[];
  status: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  price: number;
  category: string;
}

export interface Agent {
  id: string;
  callsign: string;
  class: string;
  wallet: string;
  status: string;
  reputation: number;
}

export interface MarketplaceListing {
  id: string;
  seller: string;
  name: string;
  type: string;
  price: number;
  currency: string;
}

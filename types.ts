
export enum BiometricType {
  FACIAL = 'FACIAL',
  VOICE = 'VOICE',
  BLOCKCHAIN = 'BLOCKCHAIN',
  SCAN_MACHINE = 'SCAN_MACHINE'
}

export interface BiometricResult {
  id: string;
  type: BiometricType;
  timestamp: number;
  score: number;
  details: string;
  status: 'Pass' | 'Fail' | 'Pending';
}

export interface WalletNode {
  id: string;
  address: string;
  name: string;
  totalValue: string;
  securityScore: number;
  isLocked: boolean;
  assets: WalletAsset[];
  providerName?: string; // Track which wallet was used
}

// EIP-6963 Interfaces
export interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: any;
}

export interface EIP6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
}

export interface UserProfile {
  id: string;
  username: string;
  createdAt: number;
  results: BiometricResult[];
  nftUri?: string;
  isMinted: boolean;
  walletAddress?: string;
  wallets: WalletNode[];
  isIdGenerated?: boolean;
}

export interface WalletAsset {
  name: string;
  symbol: string;
  balance: string;
  riskScore: number;
  riskReason: string;
  type: 'TOKEN' | 'NFT' | 'CONTRACT';
  verifiedLink?: string;
  isUnverified?: boolean;
}

export interface SecurityLog {
  id: string;
  timestamp: number;
  event: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  source: string;
}

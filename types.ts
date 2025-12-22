
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
}

export interface UserProfile {
  id: string;
  username: string;
  createdAt: number;
  results: BiometricResult[];
  nftUri?: string;
  isMinted: boolean;
  walletAddress?: string; // Legacy support
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

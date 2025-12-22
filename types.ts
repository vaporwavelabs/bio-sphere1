
export enum BiometricType {
  FACIAL = 'FACIAL',
  VOICE = 'VOICE',
  BLOCKCHAIN = 'BLOCKCHAIN'
}

export interface BiometricResult {
  id: string;
  type: BiometricType;
  timestamp: number;
  score: number;
  details: string;
  status: 'Pass' | 'Fail' | 'Pending';
}

export interface UserProfile {
  id: string;
  username: string;
  createdAt: number;
  results: BiometricResult[];
  nftUri?: string;
  isMinted: boolean;
  walletAddress?: string;
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

import { Keypair, PublicKey } from "@solana/web3.js";

export interface UserState {
  action: string;
  data?: {
    recipientAddress?: string;
    playerTag?: string;
    betAmount?: number;
    targetPosition?: number;
    predictedStars?: number;
    escrowAccount?: string;
    [key: string]: any;
  };
}

export interface UserWallets {
  [userId: number]: Keypair;
}

export interface UserProfile {
  playerTag: string;
  clanTag: string;
  mapPosition?: number;
}

export interface UserProfiles {
  [userId: number]: UserProfile;
}

export interface ClanWarBet {
  userAddress: PublicKey;
  amount: number;
  clanTag: string;
  playerTag: string;
  targetPosition: number;
  predictedStars: number;
  escrowAccount: PublicKey;
  completed: boolean;
}

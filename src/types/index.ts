import { Keypair } from "@solana/web3.js";

export interface UserState {
  action: string;
  data?: {
    recipientAddress?: string;
    [key: string]: any;
  };
}

export interface UserWallets {
  [userId: number]: Keypair;
}

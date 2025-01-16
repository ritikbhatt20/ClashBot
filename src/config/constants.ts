import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
import dotenv from "dotenv";

dotenv.config();

export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
export const SOLANA_NETWORK = "devnet";
export const connection = new Connection(clusterApiUrl(SOLANA_NETWORK), "confirmed");
export const MIN_SOL_FOR_FEES = 0.000005; // 5000 lamports
export const AIRDROP_AMOUNT = 1; // Amount of SOL to airdrop for new wallets

export const CLASH_API_TOKEN = process.env.CLASH_API_TOKEN ?? "";
// export const ESCROW_PROGRAM_ID = new PublicKey(process.env.ESCROW_PROGRAM_ID ?? "");
export const MULTIPLIER = 1.5; // Winning multiplier

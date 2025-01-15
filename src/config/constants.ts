import { Connection, clusterApiUrl } from "@solana/web3.js";
import dotenv from "dotenv";

dotenv.config();

export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
export const SOLANA_NETWORK = "devnet";
export const connection = new Connection(clusterApiUrl(SOLANA_NETWORK), "confirmed");
export const MIN_SOL_FOR_FEES = 0.000005; // 5000 lamports
export const AIRDROP_AMOUNT = 1; // Amount of SOL to airdrop for new wallets
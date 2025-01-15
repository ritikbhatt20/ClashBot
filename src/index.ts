import TelegramBot from "node-telegram-bot-api";
import { TELEGRAM_BOT_TOKEN } from "./utils/dotenvConfig";
import { handleMessage } from "./handlers/messageHandler";
import { Keypair } from "@solana/web3.js";

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
export const userWallets: { [userId: number]: Keypair } = {};
export const userState: { [userId: number]: { action: string; data?: any } } = {};

bot.on("message", (msg) => handleMessage(msg, bot, userWallets, userState));

console.log("Bot is running...");

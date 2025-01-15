import TelegramBot from "node-telegram-bot-api";
import { TELEGRAM_BOT_TOKEN } from "./config/constants";
import { handleMessage } from "./handlers/messageHandler";
import { UserWallets, UserState } from "./types";

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
export const userWallets: UserWallets = {};
const userState: { [userId: number]: UserState } = {};

bot.on("message", async (msg) => {
  await handleMessage(msg, bot, userWallets, userState);
});

console.log("Solana Wallet Bot is running...");

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error);
});

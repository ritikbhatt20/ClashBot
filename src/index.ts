import TelegramBot from "node-telegram-bot-api";
import { TELEGRAM_BOT_TOKEN } from "./config/constants";
import { handleMessage } from "./handlers/messageHandler";
import { UserWallets, UserState, UserProfiles } from "./types";
import { StateManager } from '../src/services/stateManager';
import { pool } from './config/database';
import "reflect-metadata";

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
export const stateManager = new StateManager();
export const userWallets: UserWallets = {};
export const userState: { [userId: number]: UserState } = {};
export const userProfiles: UserProfiles = {};

// Initialize database connection
pool.connect()
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(err => console.error('Database connection error:', err));

bot.on("message", async (msg) => {
  await handleMessage(msg, bot, userWallets, userState, userProfiles);
});

console.log("Clash of Clans Betting Bot is running...");

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error);
});

process.on('SIGINT', async () => {
  await pool.end();
  process.exit();
});

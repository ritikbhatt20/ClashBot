import TelegramBot from "node-telegram-bot-api";
import {
  Keypair,
  Connection,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import dotenv from "dotenv";

dotenv.config();
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// In-memory storage for user wallets
const userWallets: { [userId: number]: Keypair } = {};

// Start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(
    chatId,
    "Welcome to the Solana Wallet Bot! Use the dashboard below:",
    {
      reply_markup: {
        keyboard: [
          [{ text: "Create Wallet" }],
          [{ text: "View Wallet Address" }],
          [{ text: "View Wallet Balance" }],
        ],
        resize_keyboard: true,
      },
    }
  );
});

// Handle "Create Wallet"
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text || "";

  if (text === "Create Wallet") {
    if (userWallets[chatId]) {
      bot.sendMessage(chatId, "You already have a wallet!");
    } else {
      const wallet = Keypair.generate();
      userWallets[chatId] = wallet;

      bot.sendMessage(chatId, "Wallet created successfully!");
      bot.sendMessage(
        chatId,
        `Public Address: \n\`${wallet.publicKey.toString()}\``,
        {
          parse_mode: "Markdown",
        }
      );

      // Optionally airdrop some SOL to the wallet
      try {
        await connection.requestAirdrop(wallet.publicKey, LAMPORTS_PER_SOL);
        bot.sendMessage(
          chatId,
          "1 SOL has been airdropped to your wallet (Devnet)."
        );
      } catch (error) {
        bot.sendMessage(chatId, "Failed to airdrop SOL. Try again later.");
      }
    }
  }

  if (text === "View Wallet Address") {
    const wallet = userWallets[chatId];
    if (!wallet) {
      bot.sendMessage(
        chatId,
        "You don't have a wallet. Use 'Create Wallet' to generate one."
      );
    } else {
      bot.sendMessage(
        chatId,
        `Your Wallet Address: \n\`${wallet.publicKey.toString()}\``,
        {
          parse_mode: "Markdown",
        }
      );
    }
  }

  if (text === "View Wallet Balance") {
    const wallet = userWallets[chatId];
    if (!wallet) {
      bot.sendMessage(
        chatId,
        "You don't have a wallet. Use 'Create Wallet' to generate one."
      );
    } else {
      try {
        const balance = await connection.getBalance(wallet.publicKey);
        bot.sendMessage(
          chatId,
          `Your Wallet Balance: ${balance / LAMPORTS_PER_SOL} SOL`
        );
      } catch (error) {
        bot.sendMessage(chatId, "Failed to fetch balance. Try again later.");
      }
    }
  }
});

console.log("Bot is running...");

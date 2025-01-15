import TelegramBot from "node-telegram-bot-api";
import { userWallets } from "../index";
import { connection } from "../utils/connection";

export const viewWalletBalance = async (bot: TelegramBot, chatId: number) => {
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
        `Your Wallet Balance: ${balance / 1_000_000_000} SOL`
      );
    } catch (error) {
      bot.sendMessage(chatId, "Failed to fetch balance. Try again later.");
    }
  }
};

import TelegramBot from "node-telegram-bot-api";
import { createWallet } from "../commands/createWallet";
import { viewWalletAddress } from "../commands/viewWalletAddress";
import { viewWalletBalance } from "../commands/viewWalletBalance";
import { depositInstructions } from "../commands/depositInstructions";
import { withdrawSOL } from "../commands/withdrawSol";
import { UserWallets, UserState } from "../types";
import { isValidSolAddress } from "../utils/validation";

export const handleMessage = async (
  msg: TelegramBot.Message,
  bot: TelegramBot,
  userWallets: UserWallets,
  userState: { [userId: number]: UserState }
): Promise<void> => {
  const chatId = msg.chat.id;
  const text = msg.text || "";
  const currentState = userState[chatId]?.action || "";

  try {
    // Handle state-based actions
    if (currentState) {
      switch (currentState) {
        case "withdraw_recipient":
          if (!isValidSolAddress(text)) {
            await bot.sendMessage(chatId, "Invalid wallet address. Please try again.");
            delete userState[chatId];
            return;
          }
          userState[chatId].data = { recipientAddress: text };
          await bot.sendMessage(chatId, "How much SOL do you want to transfer?");
          userState[chatId].action = "withdraw_amount";
          return;

        case "withdraw_amount":
          await withdrawSOL(bot, chatId, text, userWallets, userState);
          return;

        default:
          delete userState[chatId];
          break;
      }
    }

    // Handle commands
    switch (text) {
      case "/start":
        await bot.sendMessage(
          chatId,
          "Welcome to the Solana Wallet Bot! Use the dashboard below:",
          {
            reply_markup: {
              keyboard: [
                [{ text: "Create Wallet" }],
                [{ text: "View Wallet Address" }, { text: "View Wallet Balance" }],
                [{ text: "Withdraw SOL" }, { text: "Deposit Instructions" }],
              ],
              resize_keyboard: true,
            },
          }
        );
        break;

      case "Create Wallet":
        await createWallet(chatId, bot, userWallets);
        break;

      case "View Wallet Address":
        await viewWalletAddress(bot, chatId);
        break;

      case "View Wallet Balance":
        await viewWalletBalance(bot, chatId);
        break;

      case "Withdraw SOL":
        if (!userWallets[chatId]) {
          await bot.sendMessage(
            chatId,
            "You don't have a wallet. Use 'Create Wallet' to generate one."
          );
        } else {
          await bot.sendMessage(chatId, "Please send the recipient's wallet address:");
          userState[chatId] = { action: "withdraw_recipient" };
        }
        break;

      case "Deposit Instructions":
        await depositInstructions(bot, chatId);
        break;

      default:
        await bot.sendMessage(chatId, "Invalid command. Please use the dashboard options.");
        break;
    }
  } catch (error) {
    console.error("Message handler error:", error);
    await bot.sendMessage(
      chatId,
      "An error occurred. Please try again later."
    );
  }
};

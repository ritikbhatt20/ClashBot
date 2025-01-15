import TelegramBot from "node-telegram-bot-api";
import { createWallet } from "../commands/createWallet";
import { viewWalletAddress } from "../commands/viewWalletAddress";
import { viewWalletBalance } from "../commands/viewWalletBalance";
import { depositInstructions } from "../commands/depositInstructions";
import { withdrawSOL } from "../commands/withdrawSol";
import { connection } from "../utils/connection";
import { Keypair, PublicKey } from "@solana/web3.js";

export const handleMessage = (
  msg: TelegramBot.Message,
  bot: TelegramBot,
  userWallets: { [userId: number]: Keypair },
  userState: { [userId: number]: { action: string; data?: any } } // Added user state
) => {
  const chatId = msg.chat.id;
  const text = msg.text || "";

  // Get the current state for the user
  const currentState = userState[chatId]?.action || "";

  // Process state-specific actions first
  if (currentState) {
    switch (currentState) {
      case "withdraw_recipient":
        try {
          const recipientAddress = new PublicKey(text); // Validate the address
          userState[chatId].data = {
            recipientAddress: recipientAddress.toBase58(),
          };
          bot.sendMessage(chatId, "How much SOL do you want to transfer?");
          userState[chatId].action = "withdraw_amount";
        } catch (error) {
          bot.sendMessage(chatId, "Invalid wallet address. Please try again.");
          delete userState[chatId]; // Reset state
        }
        return;

      case "withdraw_amount":
        withdrawSOL(bot, chatId, text, userWallets, userState);
        return;

      default:
        // Reset state if invalid
        delete userState[chatId];
        break;
    }
  }

  // Handle primary commands
  switch (text) {
    case "/start":
      bot.sendMessage(
        chatId,
        "Welcome to the Solana Wallet Bot! Use the dashboard below:",
        {
          reply_markup: {
            keyboard: [
              [{ text: "Create Wallet" }],
              [{ text: "View Wallet Address" }],
              [{ text: "View Wallet Balance" }],
              [{ text: "Withdraw SOL" }],
              [{ text: "Deposit Instructions" }],
            ],
            resize_keyboard: true,
          },
        }
      );
      break;

    case "Create Wallet":
      createWallet(chatId, bot, userWallets);
      break;

    case "View Wallet Address":
      viewWalletAddress(bot, chatId);
      break;

    case "View Wallet Balance":
      viewWalletBalance(bot, chatId);
      break;

    case "Withdraw SOL":
      const wallet = userWallets[chatId];
      if (!wallet) {
        bot.sendMessage(
          chatId,
          "You don't have a wallet. Use 'Create Wallet' to generate one."
        );
      } else {
        bot.sendMessage(chatId, "Please send the recipient's wallet address:");
        userState[chatId] = { action: "withdraw_recipient" };
      }
      break;

    case "Deposit Instructions":
      depositInstructions(bot, chatId);
      break;

    default:
      bot.sendMessage(chatId, "Invalid command. Use the dashboard options.");
      break;
  }
};

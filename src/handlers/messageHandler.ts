import TelegramBot from "node-telegram-bot-api";
import { createWallet } from "../commands/createWallet";
import { viewWalletAddress } from "../commands/viewWalletAddress";
import { viewWalletBalance } from "../commands/viewWalletBalance";
import { depositInstructions } from "../commands/depositInstructions";
import { withdrawSOL } from "../commands/withdrawSol";
import { UserWallets, UserState, UserProfiles } from "../types";
import { isValidSolAddress, isValidAmount } from "../utils/validation";
import {
  registerPlayer,
  verifyAttack,
  placeBet,
} from "../commands/clashCommands";
import { stateManager } from "../index";

export const handleMessage = async (
  msg: TelegramBot.Message,
  bot: TelegramBot,
  userWallets: UserWallets,
  userState: { [userId: number]: UserState },
  userProfiles: UserProfiles
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
            await bot.sendMessage(
              chatId,
              "Invalid wallet address. Please try again."
            );
            delete userState[chatId];
            return;
          }
          userState[chatId].data = { recipientAddress: text };
          await bot.sendMessage(
            chatId,
            "How much SOL do you want to transfer?"
          );
          userState[chatId].action = "withdraw_amount";
          return;

        case "withdraw_amount":
          await withdrawSOL(bot, chatId, text, userWallets, userState);
          return;

        case "register_player":
          await registerPlayer(bot, chatId, text, userProfiles);
          delete userState[chatId];
          return;

        case "place_bet_amount":
          if (!isValidAmount(text)) {
            await bot.sendMessage(
              chatId,
              "Invalid amount. Please enter a positive number."
            );
            return;
          }
          userState[chatId].data = { betAmount: parseFloat(text) };
          await bot.sendMessage(
            chatId,
            "Enter the target position number (1-15):"
          );
          userState[chatId].action = "place_bet_position";
          return;

        case "place_bet_position":
          const position = parseInt(text);
          if (isNaN(position) || position < 1 || position > 15) {
            await bot.sendMessage(
              chatId,
              "Invalid position. Please enter a number between 1 and 15."
            );
            return;
          }
          userState[chatId].data = {
            ...userState[chatId].data,
            targetPosition: position,
          };
          await bot.sendMessage(chatId, "Enter predicted stars (0-3):");
          userState[chatId].action = "place_bet_stars";
          return;

        case "place_bet_stars":
          const stars = parseInt(text);
          if (isNaN(stars) || stars < 0 || stars > 3) {
            await bot.sendMessage(
              chatId,
              "Invalid stars. Please enter a number between 0 and 3."
            );
            return;
          }

          // Now we have all the data, call placeBet
          const betData = userState[chatId].data;
          if (betData?.betAmount && betData?.targetPosition) {
            await placeBet(
              bot,
              chatId,
              betData.betAmount,
              betData.targetPosition,
              stars,
              userWallets,
              userProfiles,
              stateManager
            );
          }
          delete userState[chatId];
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
                [
                  { text: "View Wallet Address" },
                  { text: "View Wallet Balance" },
                ],
                [{ text: "Withdraw SOL" }, { text: "Deposit Instructions" }],
                [{ text: "Register Player" }],
                [{ text: "Place Bet" }],
                [{ text: "Verify Attack" }],
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
          await bot.sendMessage(
            chatId,
            "Please send the recipient's wallet address:"
          );
          userState[chatId] = { action: "withdraw_recipient" };
        }
        break;

      case "Deposit Instructions":
        await depositInstructions(bot, chatId);
        break;

      case "Register Player":
        await bot.sendMessage(chatId, "Please enter your player tag:");
        userState[chatId] = { action: "register_player" };
        break;

      case "Place Bet":
        if (!userProfiles[chatId]) {
          await bot.sendMessage(
            chatId,
            "Please register your player tag first!"
          );
          return;
        }
        await bot.sendMessage(chatId, "Enter bet amount in SOL:");
        userState[chatId] = { action: "place_bet_amount" };
        break;

      case "Verify Attack":
        await verifyAttack(bot, chatId, userProfiles, stateManager);
        break;

      default:
        await bot.sendMessage(
          chatId,
          "Invalid command. Please use the dashboard options."
        );
        break;
    }
  } catch (error) {
    console.error("Message handler error:", error);
    await bot.sendMessage(chatId, "An error occurred. Please try again later.");
  }
};

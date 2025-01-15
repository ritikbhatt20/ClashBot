import TelegramBot from "node-telegram-bot-api";
import { userWallets } from "../index";

export const depositInstructions = (bot: TelegramBot, chatId: number) => {
  const wallet = userWallets[chatId];
  if (!wallet) {
    bot.sendMessage(
      chatId,
      "You don't have a wallet. Use 'Create Wallet' to generate one."
    );
  } else {
    bot.sendMessage(
      chatId,
      `To deposit SOL, send it to your wallet address:\n\`${wallet.publicKey.toString()}\`\n\nYou can use any wallet to transfer SOL to this address.`,
      {
        parse_mode: "Markdown",
      }
    );
  }
};

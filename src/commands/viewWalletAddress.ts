import TelegramBot from "node-telegram-bot-api";
import { userWallets } from "../index";

export const viewWalletAddress = (bot: TelegramBot, chatId: number) => {
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
};

import { Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { connection } from "../utils/connection";
import TelegramBot from "node-telegram-bot-api";

export const createWallet = async (chatId: number, bot: TelegramBot, userWallets: { [userId: number]: Keypair }) => {
  if (userWallets[chatId]) {
    bot.sendMessage(chatId, "You already have a wallet!");
    return;
  }

  const wallet = Keypair.generate();
  userWallets[chatId] = wallet;
  const privateKey = `[${wallet.secretKey.toString()}]`;

  bot.sendMessage(chatId, "Wallet created successfully!");
  bot.sendMessage(
    chatId,
    `Public Address: \n\`${wallet.publicKey.toString()}\`\n\n**Private Key** (Save this securely! Do NOT share it):\n\`${privateKey}\``,
    { parse_mode: "Markdown" }
  );

  try {
    await connection.requestAirdrop(wallet.publicKey, LAMPORTS_PER_SOL);
    bot.sendMessage(chatId, "1 SOL has been airdropped to your wallet (Devnet).");
  } catch {
    bot.sendMessage(chatId, "Failed to airdrop SOL. Try again later.");
  }
};

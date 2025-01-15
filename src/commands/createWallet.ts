import { Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { connection, AIRDROP_AMOUNT } from "../config/constants";
import { UserWallets } from "../types";
import TelegramBot from "node-telegram-bot-api";

export const createWallet = async (
  chatId: number,
  bot: TelegramBot,
  userWallets: UserWallets
): Promise<void> => {
  try {
    if (userWallets[chatId]) {
      await bot.sendMessage(chatId, "You already have a wallet!");
      return;
    }

    const wallet = Keypair.generate();
    userWallets[chatId] = wallet;
    const privateKey = `[${wallet.secretKey.toString()}]`;

    await bot.sendMessage(
      chatId,
      `Wallet created successfully!\n\nPublic Address:\n\`${wallet.publicKey.toString()}\`\n\n` +
      `**Private Key** (Save this securely! Do NOT share it):\n\`${privateKey}\``,
      { parse_mode: "Markdown" }
    );

    try {
      const signature = await connection.requestAirdrop(
        wallet.publicKey,
        AIRDROP_AMOUNT * LAMPORTS_PER_SOL
      );
      await connection.confirmTransaction(signature);
      await bot.sendMessage(
        chatId,
        `${AIRDROP_AMOUNT} SOL has been airdropped to your wallet (Devnet).`
      );
    } catch (error) {
      await bot.sendMessage(
        chatId,
        "Wallet created, but airdrop failed. Try requesting SOL later."
      );
    }
  } catch (error) {
    await bot.sendMessage(
      chatId,
      "Failed to create wallet. Please try again later."
    );
  }
};

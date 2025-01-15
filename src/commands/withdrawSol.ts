import TelegramBot from "node-telegram-bot-api";
import { userWallets } from "../index";
import { connection } from "../utils/connection";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, sendAndConfirmTransaction, Keypair } from "@solana/web3.js";

export const withdrawSOL = async (
  bot: TelegramBot,
  chatId: number,
  amountText: string,
  userWallets: { [userId: number]: Keypair },
  userState: { [userId: number]: { action: string; data?: any } }
) => {
  const wallet = userWallets[chatId];
  const recipientAddress = userState[chatId]?.data?.recipientAddress;

  if (!recipientAddress) {
    bot.sendMessage(chatId, "Recipient address missing. Please try again.");
    delete userState[chatId];
    return;
  }

  try {
    const recipientPublicKey = new PublicKey(recipientAddress);
    const amountLamports = parseFloat(amountText) * LAMPORTS_PER_SOL;

    if (isNaN(amountLamports) || amountLamports <= 0) {
      bot.sendMessage(chatId, "Invalid amount. Please try again.");
      delete userState[chatId];
      return;
    }

    const balance = await connection.getBalance(wallet.publicKey);
    if (amountLamports + 5000 > balance) {
      bot.sendMessage(chatId, "Insufficient balance.");
      delete userState[chatId];
      return;
    }

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: recipientPublicKey,
        lamports: amountLamports,
      })
    );

    const { blockhash } = await connection.getLatestBlockhash("confirmed");
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;

    const signature = await sendAndConfirmTransaction(connection, transaction, [
      wallet,
    ]);

    bot.sendMessage(
      chatId,
      `Success! Check the transaction here:\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`
    );
  } catch (error) {
    bot.sendMessage(chatId, "Transaction failed. Please try again.");
  }

  delete userState[chatId]; // Reset user state after completing the transaction
};

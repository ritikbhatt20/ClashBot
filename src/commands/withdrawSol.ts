import TelegramBot from "node-telegram-bot-api";
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { connection, MIN_SOL_FOR_FEES } from "../config/constants";
import { UserWallets, UserState } from "../types";
import { isValidAmount, isValidSolAddress } from "../utils/validation";
import { lamportsToSol, solToLamports } from "../utils/formatters";

export const withdrawSOL = async (
  bot: TelegramBot,
  chatId: number,
  amountText: string,
  userWallets: UserWallets,
  userState: { [userId: number]: UserState }
): Promise<void> => {
  try {
    const wallet = userWallets[chatId];
    const recipientAddress = userState[chatId]?.data?.recipientAddress;

    if (!recipientAddress || !isValidSolAddress(recipientAddress)) {
      await bot.sendMessage(chatId, "Invalid recipient address. Please try again.");
      delete userState[chatId];
      return;
    }

    if (!isValidAmount(amountText)) {
      await bot.sendMessage(chatId, "Invalid amount. Please enter a positive number.");
      delete userState[chatId];
      return;
    }

    const recipientPublicKey = new PublicKey(recipientAddress);
    const amountLamports = solToLamports(parseFloat(amountText));
    const balance = await connection.getBalance(wallet.publicKey);

    if (amountLamports + solToLamports(MIN_SOL_FOR_FEES) > balance) {
      await bot.sendMessage(
        chatId,
        `Insufficient balance. Your balance is ${lamportsToSol(balance)} SOL.`
      );
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

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;

    const signature = await connection.sendTransaction(transaction, [wallet]);
    await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight,
    });

    await bot.sendMessage(
      chatId,
      `Transaction successful!\n\nCheck the transaction here:\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`
    );
  } catch (error) {
    await bot.sendMessage(
      chatId,
      "Transaction failed. Please check your balance and try again."
    );
    console.error("Withdrawal error:", error);
  }

  delete userState[chatId];
};

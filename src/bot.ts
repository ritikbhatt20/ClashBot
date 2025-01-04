import TelegramBot from "node-telegram-bot-api";
import {
  Keypair,
  Connection,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  PublicKey,
} from "@solana/web3.js";
import dotenv from "dotenv";

dotenv.config();
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// In-memory storage for user wallets
const userWallets: { [userId: number]: Keypair } = {};

// Handle user actions
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text || "";

  if (text === "/start") {
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
  }
  else if (text === "Create Wallet") {
    if (userWallets[chatId]) {
      bot.sendMessage(chatId, "You already have a wallet!");
    } else {
      const wallet = Keypair.generate();
      userWallets[chatId] = wallet;

      const privateKey = `[${wallet.secretKey.toString()}]`;

      bot.sendMessage(chatId, "Wallet created successfully!");
      bot.sendMessage(
        chatId,
        `Public Address: \n\`${wallet.publicKey.toString()}\`\n\n**Private Key** (Save this securely! Do NOT share it):\n\`${privateKey}\``,
        {
          parse_mode: "Markdown",
        }
      );

      // Airdrop 1 SOL to the wallet
      try {
        await connection.requestAirdrop(wallet.publicKey, LAMPORTS_PER_SOL);
        bot.sendMessage(
          chatId,
          "1 SOL has been airdropped to your wallet (Devnet)."
        );
      } catch (error) {
        bot.sendMessage(chatId, "Failed to airdrop SOL. Try again later.");
      }
    }
  }

  else if (text === "View Wallet Address") {
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
  }

  else if (text === "View Wallet Balance") {
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
          `Your Wallet Balance: ${balance / LAMPORTS_PER_SOL} SOL`
        );
      } catch (error) {
        bot.sendMessage(chatId, "Failed to fetch balance. Try again later.");
      }
    }
  }

  else if (text === "Withdraw SOL") {
    const wallet = userWallets[chatId];
    if (!wallet) {
      bot.sendMessage(
        chatId,
        "You don't have a wallet. Use 'Create Wallet' to generate one."
      );
    } else {
      bot.sendMessage(chatId, "Please send the recipient's wallet address:");

      bot.once("message", async (recipientMsg) => {
        const recipientAddress = recipientMsg.text?.trim() || "";
        try {
          const recipientPublicKey = new PublicKey(recipientAddress);

          bot.sendMessage(chatId, "How much SOL do you want to transfer?");
          bot.once("message", async (amountMsg) => {
            const amountText = amountMsg.text?.trim() || "";
            const amountLamports = parseFloat(amountText) * LAMPORTS_PER_SOL;

            if (isNaN(amountLamports) || amountLamports <= 0) {
              bot.sendMessage(chatId, "Invalid amount. Try again.");
              return;
            }

            const balance = await connection.getBalance(wallet.publicKey);
            if (amountLamports + 5000 > balance) {
              bot.sendMessage(chatId, "Insufficient balance.");
              return;
            }

            const transaction = new Transaction().add(
              SystemProgram.transfer({
                fromPubkey: wallet.publicKey,
                toPubkey: recipientPublicKey,
                lamports: amountLamports,
              })
            );

            const { blockhash } = await connection.getLatestBlockhash(
              "confirmed"
            );
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = wallet.publicKey;

            try {
              const signature = await sendAndConfirmTransaction(
                connection,
                transaction,
                [wallet]
              );
              bot.sendMessage(
                chatId,
                `Success! Check the transaction here:\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`
              );
            } catch (error) {
              bot.sendMessage(
                chatId,
                "Transaction failed. Please try again."
              );
            }
          });
        } catch (error) {
          bot.sendMessage(chatId, "Invalid wallet address. Try again.");
        }
      });
    }
  }

  else if (text === "Deposit Instructions") {
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
  }
  else {
    bot.sendMessage(chatId, "Invalid command. Please choose a valid option from the dashboard.");
  }
});

console.log("Bot is running...");

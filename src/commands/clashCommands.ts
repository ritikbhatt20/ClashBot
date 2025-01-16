import TelegramBot from "node-telegram-bot-api";
import { UserWallets, UserProfiles, UserState } from "../types";
import { getPlayerInfo, getCurrentWar } from "../utils/clashApi";
import { transferLamportsToEscrow } from "../utils/escrow";
import { connection, MULTIPLIER } from "../config/constants";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { StateManager } from "../stateManager";

export async function registerPlayer(
  bot: TelegramBot,
  chatId: number,
  playerTag: string,
  userProfiles: UserProfiles
): Promise<void> {
  try {
    const playerInfo = await getPlayerInfo(playerTag);
    
    userProfiles[chatId] = {
      playerTag: playerTag,
      clanTag: playerInfo.clan.tag
    };

    await bot.sendMessage(
      chatId,
      `Successfully registered!\nPlayer: ${playerInfo.name}\nClan: ${playerInfo.clan.name}`
    );
  } catch (error) {
    await bot.sendMessage(chatId, "Failed to register player. Please check your player tag.");
  }
}

export async function placeBet(
  bot: TelegramBot,
  chatId: number,
  amount: number,
  targetPosition: number,
  predictedStars: number,
  userWallets: UserWallets,
  userProfiles: UserProfiles,
  stateManager: StateManager
): Promise<void> {
  try {
    const userProfile = userProfiles[chatId];
    if (!userProfile) {
      await bot.sendMessage(chatId, "Please register your player tag first!");
      return;
    }

    const warInfo = await getCurrentWar(userProfile.clanTag);
    if (warInfo.state !== "inWar") {
      await bot.sendMessage(chatId, "Your clan is not currently in war!");
      return;
    }

    const targetMember = warInfo.opponent.members.find(
      (member: any) => member.mapPosition === targetPosition
    );
    if (!targetMember) {
      await bot.sendMessage(chatId, "Invalid target position! Please choose a valid opponent position.");
      return;
    }

    const wallet = userWallets[chatId];
    const balance = await connection.getBalance(wallet.publicKey);
    
    if (balance < amount * LAMPORTS_PER_SOL) {
      await bot.sendMessage(chatId, "Insufficient balance for this bet!");
      return;
    }

    const escrowAccount = await transferLamportsToEscrow(amount, wallet);
    
    // Update state using state manager
    stateManager.setState(chatId, {
      action: "betting",
      data: {
        betAmount: amount,
        targetPosition: targetPosition,
        predictedStars: predictedStars,
        escrowAccount: escrowAccount.toString(),
        targetTag: targetMember.tag
      }
    });

    console.log("Setting user state:", chatId, stateManager.getState(chatId));

    await bot.sendMessage(
      chatId,
      `Bet placed successfully!\nAmount: ${amount} SOL\nTarget Position: ${targetPosition} (${targetMember.name})\nPredicted Stars: ${predictedStars}`
    );
  } catch (error) {
    console.error("Place bet error:", error);
    await bot.sendMessage(chatId, "Failed to place bet. Please try again.");
  }
}

export async function verifyAttack(
  bot: TelegramBot,
  chatId: number,
  userProfiles: UserProfiles,
  stateManager: StateManager
): Promise<void> {
  try {
    console.log("Starting verification for chatId:", chatId);
    
    const userState = stateManager.getState(chatId);
    console.log("Current userState:", userState);

    const userProfile = userProfiles[chatId];
    if (!userProfile) {
      await bot.sendMessage(chatId, "Please register your player tag first!");
      return;
    }

    if (!userState || !userState.data) {
      console.log("No userState found for chatId:", chatId);
      await bot.sendMessage(chatId, "No active bet found!");
      return;
    }

    const betData = userState.data;
    console.log("Bet Data found:", betData);

    const warInfo = await getCurrentWar(userProfile.clanTag);
    
    const playerAttack = warInfo.clan.members.find(
      (member: any) => member.tag === userProfile.playerTag
    );

    if (!playerAttack || !playerAttack.attacks) {
      await bot.sendMessage(chatId, "No attack found for verification!");
      return;
    }

    const relevantAttack = playerAttack.attacks.find(
      (attack: any) => attack.defenderTag === betData.targetTag
    );

    if (!relevantAttack) {
      await bot.sendMessage(chatId, "No attack found on the target player!");
      return;
    }

    if (relevantAttack.stars === betData.predictedStars) {
      await bot.sendMessage(
        chatId,
        `Congratulations! You won your bet!\nReward: ${betData.betAmount! * MULTIPLIER} SOL`
      );
    } else {
      await bot.sendMessage(
        chatId,
        `Sorry, your prediction was incorrect. You predicted ${betData.predictedStars} stars but got ${relevantAttack.stars} stars. Better luck next time!`
      );
    }

    // Clear the state after verification
    stateManager.clearState(chatId);
  } catch (error) {
    console.error("Verify attack error:", error);
    await bot.sendMessage(chatId, "Failed to verify attack. Please try again.");
  }
}
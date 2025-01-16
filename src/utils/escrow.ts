import {
  SystemProgram,
  Transaction,
  PublicKey,
  Keypair,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { connection } from "../config/constants";

export async function transferLamportsToEscrow(
  amount: number,
  userWallet: Keypair,
): Promise<PublicKey> {
  const escrowAccount = new PublicKey("48YR5hbRt8bhJDPQbcXbS3c6FyC9qMX34A1VoWBL31jF");
  const transferIx = SystemProgram.transfer({
    fromPubkey: userWallet.publicKey,
    toPubkey: escrowAccount,
    lamports: amount * LAMPORTS_PER_SOL,
  });

  const transaction = new Transaction().add(transferIx);

  await connection.sendTransaction(transaction, [userWallet]);

  console.log(`Transferred ${amount} SOL to escrow account: ${escrowAccount.toBase58()}`);
  return escrowAccount;
}

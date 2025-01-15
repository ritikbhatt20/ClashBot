import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export const lamportsToSol = (lamports: number): number => 
  lamports / LAMPORTS_PER_SOL;

export const solToLamports = (sol: number): number => 
  sol * LAMPORTS_PER_SOL;

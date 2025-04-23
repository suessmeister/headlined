// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Cluster, PublicKey } from "@solana/web3.js";
import SnipeSweepersIDL from "../target/idl/snipe_sweepers.json";
import type { SnipeSweepers } from "../target/types/snipe_sweepers";

// Re-export the generated IDL and type
export { SnipeSweepers, SnipeSweepersIDL };

// The programId is imported from the program IDL.
export const SNIPE_SWEEPERS_PROGRAM_ID = new PublicKey(
  SnipeSweepersIDL.address,
);

// This is a helper function to get the SnipeSweepers Anchor program.
export function getSnipeSweepersProgram(
  provider: AnchorProvider,
  address?: PublicKey,
) {
  return new Program(
    {
      ...SnipeSweepersIDL,
      address: address ? address.toBase58() : SnipeSweepersIDL.address,
    } as SnipeSweepers,
    provider,
  );
}

// This is a helper function to get the program ID for the SnipeSweepers program depending on the cluster.
export function getSnipeSweepersProgramId(cluster: Cluster) {
  switch (cluster) {
    case "devnet":
    case "testnet":
      // This is the program ID for the SnipeSweepers program on devnet and testnet.
      return new PublicKey("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");
    case "mainnet-beta":
    default:
      return SNIPE_SWEEPERS_PROGRAM_ID;
  }
}

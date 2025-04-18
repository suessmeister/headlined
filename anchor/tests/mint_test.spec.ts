import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Headlined } from "../target/types/headlined";
import {
   createMint,
   getOrCreateAssociatedTokenAccount,
   mintTo,
   TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
   PublicKey,
   SystemProgram,
} from "@solana/web3.js";

const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
   "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

describe("snipe_sweeper", () => {
   const provider = anchor.AnchorProvider.env();
   anchor.setProvider(provider);
   const program = anchor.workspace.Headlined as Program<Headlined>;

   it("mints an NFT with metadata and master edition!", async () => {
      const payer = provider.wallet;
      const payerKeypair = (payer as any).payer;
      const connection = provider.connection;

      // 1. Create mint
      const mint = await createMint(
         connection,
         payerKeypair,
         payer.publicKey,
         payer.publicKey,
         0
      );

      // 2. Associated token account
      const tokenAccount = await getOrCreateAssociatedTokenAccount(
         connection,
         payerKeypair,
         mint,
         payer.publicKey
      );

      // 3. Mint 1 token to the ATA
      await mintTo(
         connection,
         payerKeypair,
         mint,
         tokenAccount.address,
         payerKeypair,
         1
      );

      // 4. Derive metadata PDA
      const [metadataPDA] = PublicKey.findProgramAddressSync(
         [
            Buffer.from("metadata"),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            mint.toBuffer(),
         ],
         TOKEN_METADATA_PROGRAM_ID
      );

      // 5. Derive master edition PDA
      const [masterEditionPDA] = PublicKey.findProgramAddressSync(
         [
            Buffer.from("metadata"),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            mint.toBuffer(),
            Buffer.from("edition"),
         ],
         TOKEN_METADATA_PROGRAM_ID
      );

      console.log("your master edition pda is", masterEditionPDA)

      // 6. Send transaction through Anchor
      try {
         const txSignature = await program.methods
            .mint(
               "SSG 69.. ver3",
               "HDLN",
               "https://wqugnpbct3htljddcnr6b6ycpi6ppkfcob45qahfxi2bsg3swaha.arweave.net/tChmvCKezzWkYxNj4PsCejz3qKJwedgA5bo0GRtysA4"
            )
            .accounts({
               payer: payer.publicKey,
               mint,
               metadata: metadataPDA,
               masterEdition: masterEditionPDA,
               tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
            })
            .signers([payerKeypair])
            .rpc();

         console.log("✅ Anchor call succeeded. Tx signature:", txSignature);
         console.log("🎉 NFT Minted! Mint address:", mint.toBase58());
      } catch (err) {
         console.error("🚨 Anchor call failed:", err);
         if ((err as any).logs) {
            console.error("🔍 Transaction logs:");
            for (const log of (err as any).logs) {
               console.error(log);
            }
         }
      }
   }, 200_000);
});
import * as anchor from "@coral-xyz/anchor";
import {
   createMint,
   getOrCreateAssociatedTokenAccount,
   mintTo,
   TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import * as fs from "fs";

const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
   "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

describe("mint NFT to collection", () => {
   const provider = anchor.AnchorProvider.env();
   anchor.setProvider(provider);
   const program = anchor.workspace.Headlined;

   it("mints an NFT into a collection", async () => {
      // Load collection data from JSON file
      const collectionData = JSON.parse(
         fs.readFileSync(
            "/home/suess2shiesty/colosseum/headlined2/headlined/data/collection_addresses.json",
            "utf-8"
         )
      );

      const gunData = JSON.parse(
         fs.readFileSync(
            "/home/suess2shiesty/colosseum/headlined2/headlined/data/arweave_links.json",
            "utf-8"
         )
      );

      // Select a collection (e.g., the first one)


      const collection = collectionData.collections[3];
      const gun = gunData.snipers[3];
      const gunName = gun.name;
      const gunMetadata = gun.metadata_link;

   
      const collectionName = collection.name;
      const collectionMint = new PublicKey(collection.collectionMint);
      const collectionMetadata = new PublicKey(collection.collectionMetadata);
      const collectionMasterEdition = new PublicKey(
         collection.collectionMasterEdition
      );

      console.log("Using collection:", collection.name);

      const payer = provider.wallet;
      const payerKeypair = (payer as any).payer;
      const connection = provider.connection;

      // Create a new mint for the child NFT
      const childMint = await createMint(
         connection,
         payerKeypair,
         payer.publicKey,
         payer.publicKey,
         0
      );
      console.log("Child Mint:", childMint.toBase58());

      // Create an associated token account for the child NFT
      const childTokenAccount = await getOrCreateAssociatedTokenAccount(
         connection,
         payerKeypair,
         childMint,
         payer.publicKey
      );
      console.log("Child Token Account:", childTokenAccount.address.toBase58());

      // Mint 1 token to the associated token account
      await mintTo(
         connection,
         payerKeypair,
         childMint,
         childTokenAccount.address,
         payerKeypair,
         1
      );

      // Derive metadata PDA for the child NFT
      const [childMetadata] = PublicKey.findProgramAddressSync(
         [
            Buffer.from("metadata"),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            childMint.toBuffer(),
         ],
         TOKEN_METADATA_PROGRAM_ID
      );

      // Derive master edition PDA for the child NFT
      const [childMasterEdition] = PublicKey.findProgramAddressSync(
         [
            Buffer.from("metadata"),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            childMint.toBuffer(),
            Buffer.from("edition"),
         ],
         TOKEN_METADATA_PROGRAM_ID
      );

      console.log("Child Metadata PDA:", childMetadata.toBase58());
      console.log("Child Master Edition PDA:", childMasterEdition.toBase58());

      // Mint the child NFT into the collection
      try {
         await program.methods
            .mint(
               collectionName,
               gunName,
               gunMetadata,
            )
            .accounts({
               payer: payer.publicKey,
               mint: childMint,
               metadata: childMetadata,
               masterEdition: childMasterEdition,
               collectionMint,
               collectionMetadata,
               collectionMasterEdition,
               tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
               systemProgram: anchor.web3.SystemProgram.programId,
               rent: anchor.web3.SYSVAR_RENT_PUBKEY,
               tokenProgram: TOKEN_PROGRAM_ID,
            })
            .signers([payerKeypair])
            .rpc();

         console.log("✅ Child NFT minted successfully!");
         console.log("Child Mint Address:", childMint.toBase58());
      } catch (error) {
         console.error("🚨 Error minting child NFT:", error);
         if ((error as any).logs) {
            console.error("🔍 Transaction logs:", (error as any).logs);
         }
      }
   }, 200_000);
});
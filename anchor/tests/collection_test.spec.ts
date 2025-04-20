import * as anchor from "@coral-xyz/anchor";
import {
   createMint,
   getAssociatedTokenAddress,
   getOrCreateAssociatedTokenAccount,
   mintTo,
   TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
   MPL_TOKEN_METADATA_PROGRAM_ID,
   fetchMetadataFromSeeds,
} from "@metaplex-foundation/mpl-token-metadata";
import { PublicKey } from "@solana/web3.js";

const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
   "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

describe("mint NFT into collection", () => {
   const provider = anchor.AnchorProvider.env();
   anchor.setProvider(provider);
   const program: anchor.Program = anchor.workspace.Headlined;

   const payer = provider.wallet;

   it("creates a collection and mints a child NFT", async () => {
      // 1. Create Collection Mint

      const payer = provider.wallet;
      const payerKeypair = (payer as any).payer;
      const connection = provider.connection;

      // Create Mint
      const collectionMint = await createMint(
         provider.connection,
         payerKeypair,
         payer.publicKey,
         payer.publicKey,
         0
      );
      console.log("Collection Mint: ", collectionMint.toBase58());

      // Assoaciated Token Account
      const tokenAccount = await getOrCreateAssociatedTokenAccount(
         connection,
         payerKeypair,
         collectionMint,
         payer.publicKey
      );
      console.log("Collection Token Account: ", tokenAccount.address.toBase58());

      // Mint 1 token to the ATA
      await mintTo(
         connection,
         payerKeypair,
         collectionMint,
         tokenAccount.address,
         payerKeypair,
         1
      );


      // Derive PDAs for collection
      const [collectionMetadata] = anchor.web3.PublicKey.findProgramAddressSync(
         [
            Buffer.from("metadata"),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            collectionMint.toBuffer(),
         ],
         TOKEN_METADATA_PROGRAM_ID
      );
      console.log("collectionMetadata ", collectionMetadata.toBase58());

      const [collectionMasterEdition] =
         anchor.web3.PublicKey.findProgramAddressSync(
            [
               Buffer.from("metadata"),
               TOKEN_METADATA_PROGRAM_ID.toBuffer(),
               collectionMint.toBuffer(),
               Buffer.from("edition"),
            ],
            TOKEN_METADATA_PROGRAM_ID
         );
      console.log("collectionMasterEdition ", collectionMasterEdition.toBase58());

      // 2. Create Collection NFT
      try {
         await program.methods
            .createCollection("SSG 69", "COL", "https://tciyah64p6gl4ndz3aqpy7gzxbnhjtv3rqqshfxojmgajpe63xja.arweave.net/mJGAH9x_jL40edgg_HzZuFp0zruMISOW7ksMBLye3dI")
            .accounts({
               payer: payer.publicKey,
               collectionMint,
               collectionMetadata,
               collectionMasterEdition,
               tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
               tokenProgram: TOKEN_PROGRAM_ID
            })
            .signers([payerKeypair])
            .rpc();
         console.log("Collection NFT created successfully!");
         console.log("Collection Mint:", collectionMint.toBase58());
         console.log("Collection Metadata:", collectionMetadata.toBase58());
         console.log("Collection Master Edition:", collectionMasterEdition.toBase58());
      }

 
      catch (error) {
         console.error("Error creating collection NFT:", error);
         if ((error as any).logs) {
            console.error("Transaction logs:", (error as any)?.logs);
         }
      }


      // 3. Mint Child NFT into collection
      const childMint = await createMint(
         provider.connection,
         payerKeypair,
         payer.publicKey,
         payer.publicKey,
         0
      );

      // Assoaciated Token Account
      const childTokenAccount = await getOrCreateAssociatedTokenAccount(
         connection,
         payerKeypair,
         childMint,
         payer.publicKey
      );
      console.log("Collection Token Account: ", childTokenAccount.address.toBase58());

      // Mint 1 token to the ATA
      await mintTo(
         connection,
         payerKeypair,
         childMint,
         childTokenAccount.address,
         payerKeypair,
         1
      );

      const [childMetadata] = anchor.web3.PublicKey.findProgramAddressSync(
         [
            Buffer.from("metadata"),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            childMint.toBuffer(),
         ],
         TOKEN_METADATA_PROGRAM_ID
      );

      const [childMasterEdition] =
         anchor.web3.PublicKey.findProgramAddressSync(
            [
               Buffer.from("metadata"),
               TOKEN_METADATA_PROGRAM_ID.toBuffer(),
               childMint.toBuffer(),
               Buffer.from("edition"),
            ],
            TOKEN_METADATA_PROGRAM_ID
         );

         try {
            await program.methods
               .mint("SSG 69", "S69", "https://wqugnpbct3htljddcnr6b6ycpi6ppkfcob45qahfxi2bsg3swaha.arweave.net/tChmvCKezzWkYxNj4PsCejz3qKJwedgA5bo0GRtysA4")
               .accounts({
                  payer: payer.publicKey,
                  mint: childMint,
                  metadata: childMetadata,
                  masterEdition: childMasterEdition,
                  collectionMint,
                  collectionMetadata,
                  collectionMasterEdition,
                  tokenMetadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
                  systemProgram: anchor.web3.SystemProgram.programId,
                  rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                  tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
               })
               .rpc();
               console.log("child minted successfully!");
               console.log("Child Mint:", childMint.toBase58());
               console.log("Child Metadata:", childMetadata.toBase58());
               console.log("Child Master Edition:", childMasterEdition.toBase58());
               console.log("child collection, collectionMint:", collectionMint.toBase58());
         } catch (error) {
            console.error("Error minting child NFT:", error);
            if ((error as any).logs) {
               console.error("Transaction logs:", (error as any)?.logs);
            }
         }


      // // 4. Fetch and verify metadata
      // const metadata = await fetchMetadataFromSeeds(
      //    provider.connection,
      //    childMint
      // );

      // console.log("Child NFT Collection Verified:", metadata.collection?.verified);
      // expect(metadata.collection?.verified).toBe(true);
   }, 200000);
});

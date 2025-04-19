import * as anchor from "@coral-xyz/anchor";
import {
   createMint,
   getAssociatedTokenAddress,
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
   const program = anchor.workspace.Headlined as anchor.Program<any>;

   const payer = provider.wallet;

   it("creates a collection and mints a child NFT", async () => {
      // 1. Create Collection Mint

      const payer = provider.wallet;
      const payerKeypair = (payer as any).payer;
      const connection = provider.connection;


      const collectionMint = await createMint(
         provider.connection,
         payerKeypair,
         payer.publicKey,
         null,
         0
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

      // 2. Create Collection NFT
      try {
         await program.methods
            .createCollection("Collection Testes 1", "TES1", "nana")
            .accounts({
               payer: payer.publicKey,
               collectionMint,
               collectionMetadata,
               collectionMasterEdition,
               tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
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
      // const childMint = await createMint(
      //    provider.connection,
      //    payer.payer,
      //    payer.publicKey,
      //    null,
      //    0
      // );

      // const [childMetadata] = anchor.web3.PublicKey.findProgramAddressSync(
      //    [
      //       Buffer.from("metadata"),
      //       MPL_TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      //       childMint.toBuffer(),
      //    ],
      //    MPL_TOKEN_METADATA_PROGRAM_ID
      // );

      // const [childMasterEdition] =
      //    anchor.web3.PublicKey.findProgramAddressSync(
      //       [
      //          Buffer.from("metadata"),
      //          MPL_TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      //          childMint.toBuffer(),
      //          Buffer.from("edition"),
      //       ],
      //       MPL_TOKEN_METADATA_PROGRAM_ID
      //    );

      // await program.methods
      //    .mint("Sniper NFT", "SNP", "https://example.com/sniper.json")
      //    .accounts({
      //       payer: payer.publicKey,
      //       mint: childMint,
      //       metadata: childMetadata,
      //       masterEdition: childMasterEdition,
      //       collectionMint,
      //       collectionMetadata,
      //       collectionMasterEdition,
      //       tokenMetadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
      //       systemProgram: anchor.web3.SystemProgram.programId,
      //       rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      //       tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
      //    })
      //    .rpc();

      // // 4. Fetch and verify metadata
      // const metadata = await fetchMetadataFromSeeds(
      //    provider.connection,
      //    childMint
      // );

      // console.log("Child NFT Collection Verified:", metadata.collection?.verified);
      // expect(metadata.collection?.verified).toBe(true);
   }, 200000);
});

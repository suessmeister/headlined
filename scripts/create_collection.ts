// The process: Build the collection from a wallet!
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
  findCollectionAuthorityRecordPda,
} from "@metaplex-foundation/mpl-token-metadata";
import { PublicKey } from "@solana/web3.js";
import * as fs from "fs";
import * as path from "path";
console.log("test...");
import snipers from "../public/data/arweave_links.json" with { type: "json" };

const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);
const program: anchor.Program = anchor.workspace.Headlined;

const payer = provider.wallet;
const payerKeypair = (payer as any).payer;
const connection = provider.connection;

const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
);

interface CollectionInfo {
  name: string;
  collectionMint: string;
  collectionMetadata: string;
  collectionMasterEdition: string;
}

const collections: CollectionInfo[] = [];

async function createCollections() {



  console.log("Creating Collections...");
  for (const sniper of snipers.snipers) {
    const collectionMint = await createMint(
      connection,
      payerKeypair,
      payer.publicKey,
      payer.publicKey,
      0,
    );

    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      payerKeypair,
      collectionMint,
      payer.publicKey,
    );

    await mintTo(
      connection,
      payerKeypair,
      collectionMint,
      tokenAccount.address,
      payerKeypair,
      1,
    );

    const [collectionMetadata] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        collectionMint.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID,
    );

    const [collectionMasterEdition] =
      anchor.web3.PublicKey.findProgramAddressSync(
        [
          Buffer.from("metadata"),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          collectionMint.toBuffer(),
          Buffer.from("edition"),
        ],
        TOKEN_METADATA_PROGRAM_ID,
      );

    const [collectionAuthorityPda, _collectionAuthorityBump] =
      PublicKey.findProgramAddressSync(
        [Buffer.from("collection_authority"), new PublicKey(anchor.workspace.Headlined.programId).toBuffer()],
        new PublicKey(anchor.workspace.Headlined.programId)
      );
      console.log(
        "Collection Authority PDA:",
        collectionAuthorityPda.toBase58(),
      );

    try {
      await program.methods
        .createCollection(sniper.name, "COL", sniper.collection_link)
        .accounts({
          payer: payer.publicKey,
          collectionMint,
          collectionMetadata,
          collectionMasterEdition,
          collectionAuthority: collectionAuthorityPda,
          tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .remainingAccounts([
          {
            pubkey: collectionAuthorityPda,
            isWritable: false,
            isSigner: false,
          }
        ])
        .signers([payerKeypair])
        .rpc();

      collections.push({
        name: sniper.name,
        collectionMint: collectionMint.toBase58(),
        collectionMetadata: collectionMetadata.toBase58(),
        collectionMasterEdition: collectionMasterEdition.toBase58(),
      });

      console.log("Collection NFT created successfully!");
      console.log("Collection Mint:", collectionMint.toBase58());
      console.log("Collection Metadata:", collectionMetadata.toBase58());
      console.log(
        "Collection Master Edition:",
        collectionMasterEdition.toBase58(),
      );
    } catch (error) {
      console.log("error ", error);
      if ((error as any).logs) {
        console.error("Transaction logs:", (error as any)?.logs);
      }
    }
  }

  const outputPath = path.join(__dirname, "../data/collection_addresses.json");
  fs.writeFileSync(outputPath, JSON.stringify({ collections }, null, 2));
  console.log(`Collection addresses saved to ${outputPath}`);
}

createCollections();

import { Connection, PublicKey } from "@solana/web3.js";
import { Metaplex } from "@metaplex-foundation/js";

export async function getNftsForWallet(
  walletAddress: PublicKey,
  connection: Connection,
  collectionType: 'guns' | 'badges' = 'guns'
) {
  try {
    const metaplex = new Metaplex(connection);
    const nfts = await metaplex.nfts().findAllByOwner({ owner: walletAddress });

    // Choose which collection data file to use based on collection type
    const jsonPath = collectionType === 'guns'
      ? "/data/collection_addresses_2.json"
      : "/data/badge.json";

    const json = await fetch(jsonPath);
    const collectionData = await json.json();

    const collectionMints = collectionData.collections.map(
      (collection: any) => new PublicKey(collection.collectionMint),
    );

    // Filter by collection!
    const filteredNfts = nfts.filter(
      (nft) =>
        nft.collection &&
        nft.collection.verified &&
        collectionMints.some(
          (mint: PublicKey) =>
            nft.collection &&
            mint.toBase58() === nft.collection.address.toBase58(),
        ),
    );

    // Fetch metadata for each NFT
    const nftsWithMetadata = await Promise.all(
      filteredNfts.map(async (nft) => {
        try {
          const response = await fetch(nft.uri);
          const metadata = await response.json();
          return {
            name: nft.name,
            symbol: nft.symbol,
            image: metadata.image,
            description: metadata.description || "",
            mint: nft.address.toString(),
            type: collectionType, // Add type information
          };
        } catch (error) {
          console.error("Error fetching metadata:", error);
          return null;
        }
      }),
    );

    return nftsWithMetadata.filter(Boolean);
  } catch (error) {
    console.error(`Error fetching ${collectionType} NFTs:`, error);
    return [];
  }
}

// Convenience function to specifically get badges
export async function getBadgesForWallet(
  walletAddress: PublicKey,
  connection: Connection,
) {
  return getNftsForWallet(walletAddress, connection, 'badges');
}

// Convenience function to specifically get guns
export async function getGunsForWallet(
  walletAddress: PublicKey,
  connection: Connection,
) {
  return getNftsForWallet(walletAddress, connection, 'guns');
}

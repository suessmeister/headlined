import { Connection, PublicKey } from '@solana/web3.js';
import { Metaplex } from '@metaplex-foundation/js';


export async function getNftsForWallet(walletAddress: PublicKey, connection: Connection) {
   try {
      const metaplex = new Metaplex(connection);
      const nfts = await metaplex
         .nfts()
         .findAllByOwner({ owner: walletAddress });

      const json = await fetch ('/collection_addresses.json');
      const collectionData = await json.json();

      const collectionMints = collectionData.collections.map(
         (collection: any) => new PublicKey(collection.collectionMint)
      );

      // Filter by collection! 
      const gunNfts = nfts.filter(nft =>
         nft.collection &&
         nft.collection.verified &&
         collectionMints.some((mint: PublicKey) =>
            nft.collection && mint.toBase58() === nft.collection.address.toBase58()
         )
      );
         

      // Fetch metadata for each NFT
      const nftsWithMetadata = await Promise.all(
         gunNfts.map(async (nft) => {
            try {
               const response = await fetch(nft.uri);
               const metadata = await response.json();
               return {
                  name: nft.name,
                  symbol: nft.symbol,
                  image: metadata.image,
                  description: metadata.description || '',
                  mint: nft.address.toString(),
               };
            } catch (error) {
               console.error('Error fetching metadata:', error);
               return null;
            }
         })
      );

      return nftsWithMetadata.filter(Boolean);
   } catch (error) {
      console.error('Error fetching NFTs:', error);
      return [];
   }
}
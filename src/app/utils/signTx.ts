// import { SignerWalletAdapter, WalletAdapter } from "@solana/wallet-adapter-base"
// import { Connection, Keypair, Transaction } from "@solana/web3.js"

// export async function signAndSendHybridTx(tx: Transaction, signers: Keypair[], adapter: WalletAdapter, connection: Connection) {
//    tx.partialSign(...signers)

//    if (!('signTransaction' in adapter)) {
//       throw new Error('Wallet does not support direct transaction signing')
//    }

//    const signedTx = await (adapter as SignerWalletAdapter).signTransaction(tx)
//    const sig = await connection.sendRawTransaction(signedTx.serialize())
//    await connection.confirmTransaction(sig, 'confirmed')
//    return sig
// }

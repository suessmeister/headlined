// to be used for idl in the web browser

import { AnchorProvider, Program, Idl } from '@coral-xyz/anchor'
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js'
import { useWallet } from '@solana/wallet-adapter-react'
import { Wallet } from '@coral-xyz/anchor'

import idl from '../../../public/data/headlined.json'

export const PROGRAM_ID = new PublicKey(idl.address)

export function useHeadlinedProgram() {
   const wallet = useWallet()
   const provider = new AnchorProvider(
      new Connection(clusterApiUrl('devnet'), 'confirmed'),
      wallet as unknown as Wallet,
      { commitment: 'confirmed' }
   )
   const program = new Program(idl as Idl, provider)
   // console.log("using program", program.programId.toBase58())
   return { program, provider, wallet }
}



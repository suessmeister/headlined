// to be used for idl in the web browser

import { AnchorProvider, Program, Idl } from '@coral-xyz/anchor'
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js'
import { useWallet } from '@solana/wallet-adapter-react'

import idl from '../../../public/data/headlined.json'

export const PROGRAM_ID = new PublicKey(idl.address)

export function useHeadlinedProgram() {
   const wallet = useWallet()
   const provider = new AnchorProvider(
      new Connection(clusterApiUrl('devnet'), 'confirmed'),
      wallet as any,
      { commitment: 'confirmed' }
   )
   const program = new Program(idl as Idl, provider)
   return { program, provider }
}



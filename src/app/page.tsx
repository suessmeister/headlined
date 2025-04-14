'use client'
import { useWallet } from '@solana/wallet-adapter-react'
import DashboardFeature from '@/components/dashboard/dashboard-feature'
import Game from '@/components/Game'
import { useState } from 'react'
import * as anchor from "@coral-xyz/anchor";
import { Connection, clusterApiUrl, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useEffect } from 'react';


export default function Page() {

  // basic setup shit 
  const { publicKey, disconnect, sendTransaction, wallet } = useWallet()
  const [balance, setBalance] = useState<number>(0)
  const [ownedNFTs, setOwnedNFTs] = useState<any[]>([])

  // running on devnet for now
  const connection = new Connection(clusterApiUrl('devnet'), "confirmed");
  const provider = new anchor.AnchorProvider(connection, wallet as any, {
    preflightCommitment: "processed",
  });
  anchor.setProvider(provider);


  // Loading the balance of the wallet
  useEffect(() => {
    async function getBalance() {
      if (!publicKey) return
      try {
        const balance = await connection.getBalance(publicKey)
        setBalance(balance / LAMPORTS_PER_SOL)
      } catch (error) {
        console.error('Error fetching balance:', error)
      }
    }
    getBalance()
  }, [publicKey])


  return (
    <>
      <Game />



      {!publicKey && (
        <div className="text-center mb-8 p-4 bg-yellow-400/20 rounded-lg">
          <p className="text-yellow-300 text-lg">
            Connect your wallet to start collecting Pokémon NFTs!
          </p>
        </div>
      )}
    </>
  )
}

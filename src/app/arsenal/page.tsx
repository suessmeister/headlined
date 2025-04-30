"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { UiLayout } from "@/components/ui/ui-layout";
import { useState, useRef, useEffect } from "react";
import sniperData from "../../../backend/guns_nft/data/snipers.json";
import {
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
} from "@solana/web3.js";
import Image from "next/image";
import arsenalQuotes from "../../../public/quotes/arsenal.json";
import { getNftsForWallet } from "../utils/helper";
import { useHeadlinedProgram } from "../utils/anchorClient";
import toast from "react-hot-toast";
import { Keypair } from "@solana/web3.js";
import {
  createAssociatedTokenAccountInstruction,
  createInitializeMint2Instruction,
  createMintToInstruction,
  getAssociatedTokenAddress,
  MintLayout,
  mintTo,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { SignerWalletAdapter } from "@solana/wallet-adapter-base";
import { Dialog } from "@headlessui/react";
// import { FaceFrownIcon } from '@heroicons/react/24/outline'

export default function ArsenalPage() {
  const { wallet, signTransaction, publicKey } = useWallet();
  const [activeTab, setActiveTab] = useState<
    "shop" | "your-guns" | "leaderboard"
  >("your-guns");
  const [sliderPosition, setSliderPosition] = useState(0);
  const tabsRef = useRef<HTMLDivElement>(null);
  const [randomQuote, setRandomQuote] = useState<{
    quote: string;
    author: string;
  } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [ownedNFTs, setOwnedNFTs] = useState<any[]>([]);

  const [activeGun, setActiveGun] = useState<any | null>(null);
  const { program, provider } = useHeadlinedProgram();

  const connection = new Connection(
    "https://api.devnet.solana.com",
    "confirmed",
  );
  const getRandomQuote = () => {
    const quotes = arsenalQuotes.quotes;
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  };

  const MPL_TOKEN_METADATA_PROGRAM_ID = new PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
  );
  const devWallet = new PublicKey(
    "6PEe9kXaNXckNAQcgyKxGFjaoVxsSbwniv6xjFuLVrHq",
  );

  useEffect(() => {
    setRandomQuote(getRandomQuote());
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setRandomQuote(getRandomQuote());
      setIsRefreshing(false);
    }, 200);
  };

  const handleSelectGun = (gun: any) => {
    setActiveGun(gun);
    localStorage.setItem("selectedGun", JSON.stringify(gun));
    
  };

  useEffect(() => {
    if (tabsRef.current) {
      const buttons = tabsRef.current.querySelectorAll("button");
      const activeButton =
        buttons[activeTab === "shop" ? 0 : activeTab === "your-guns" ? 1 : 2];
      const buttonRect = activeButton.getBoundingClientRect();
      const containerRect = tabsRef.current.getBoundingClientRect();
      const padding = 8; // 2px padding on each side
      setSliderPosition(buttonRect.left - containerRect.left - padding);
    }
  }, [activeTab]);

  useEffect(() => {
    console.log("Active Gun:", activeGun);
    if (activeGun) {
      localStorage.setItem("selectedGun", JSON.stringify(activeGun));
    }
  }, [activeGun]);

  useEffect(() => {
    const savedGun = localStorage.getItem("selectedGun");
    if (savedGun) {
      const parsedGun = JSON.parse(savedGun);
      setActiveGun(parsedGun);
    }
  }, []);

  // Fetch owned NFTs that belong to the collection
  useEffect(() => {
    async function fetchOwnedNFTs() {
      if (!publicKey) return;
      try {
        const nfts = await getNftsForWallet(publicKey, connection);
        setOwnedNFTs(nfts);
      } catch (err) {
        console.error("Error fetching NFTs:", err);
      }
    }
    fetchOwnedNFTs();
  }, [publicKey]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGunIndex, setSelectedGunIndex] = useState<number | null>(null);

  const openModal = (index: number) => {
    setSelectedGunIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedGunIndex(null);
  };

  const confirmPurchase = () => {
    if (selectedGunIndex !== null) {
      buyGun(selectedGunIndex);
    }
    closeModal();
  };

  async function buyGun(index: number) {
    if (!publicKey) {
      toast.error("Connect your wallet to buy a gun");
      return;
    }

    console.log(program.programId.toBase58());
    const collections = await fetch("/data/collection_addresses.json"); //convert to json
    const guns = await fetch("/data/arweave_links.json");

    const collectionData = await collections.json();
    const gunData = await guns.json();

    const collection = collectionData.collections[index];
    const gun = gunData.snipers[index];

    const gunPrice = 0.03 * LAMPORTS_PER_SOL;

    console.log(collection);
    console.log(gun);

    const collectionMint = new PublicKey(collection.collectionMint);
    const collectionMetadata = new PublicKey(collection.collectionMetadata);
    const collectionMasterEdition = new PublicKey(
      collection.collectionMasterEdition,
    );

    const gunMint = Keypair.generate();
    const lamports = await connection.getMinimumBalanceForRentExemption(
      MintLayout.span,
    );

    const paymentIx = SystemProgram.transfer({
      fromPubkey: publicKey,
      toPubkey: devWallet,
      lamports: gunPrice,
    });

    const createMintIx = SystemProgram.createAccount({
      fromPubkey: publicKey,
      newAccountPubkey: gunMint.publicKey,
      space: MintLayout.span,
      lamports,
      programId: TOKEN_PROGRAM_ID,
    });

    const mintIxInit = createInitializeMint2Instruction(
      gunMint.publicKey,
      0,
      publicKey,
      publicKey,
      TOKEN_PROGRAM_ID,
    );
    const ata = await getAssociatedTokenAddress(gunMint.publicKey, publicKey);
    const ataIx = createAssociatedTokenAccountInstruction(
      publicKey,
      ata,
      publicKey,
      gunMint.publicKey,
    );

    const mintToIx = createMintToInstruction(
      gunMint.publicKey,
      ata,
      publicKey,
      1,
    );

    const [metadataPda, metadataBump] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        MPL_TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        gunMint.publicKey.toBuffer(),
      ],
      MPL_TOKEN_METADATA_PROGRAM_ID,
    );

    const [masterEditionPda, masterEditionBump] =
      PublicKey.findProgramAddressSync(
        [
          Buffer.from("metadata"),
          MPL_TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          gunMint.publicKey.toBuffer(),
          Buffer.from("edition"),
        ],
        MPL_TOKEN_METADATA_PROGRAM_ID,
      );

    const [collectionAuthorityPda, _collectionAuthorityBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("collection_authority"), program.programId.toBuffer()],
      program.programId,
    );

    console.log("Collection Authority PDA:", collectionAuthorityPda.toBase58());
    console.log(metadataPda.toBase58());
    console.log(masterEditionPda.toBase58());

    const ixMint = await program.methods
      .mint(gun.name, collection.symbol, gun.metadata_link)
      .accounts({
        payer: publicKey,
        mint: gunMint.publicKey,
        metadata: metadataPda,
        masterEdition: masterEditionPda,
        collectionMint: collectionMint,
        collectionMasterEdition: collectionMasterEdition,
        collectionMetadata: collectionMetadata,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
        tokenMetadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
        collectionAuthority: collectionAuthorityPda,
      })
      .remainingAccounts([
       {
        pubkey: collectionAuthorityPda
        , isSigner: false, isWritable: false,
       }
      ])
      .instruction();

    const tx = new Transaction().add(
      paymentIx,
      createMintIx,
      mintIxInit,
      ataIx,
      mintToIx,
      ixMint,
    );
    tx.feePayer = publicKey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash("finalized");
    // Sign with local mint keypair
    tx.partialSign(gunMint);

    try {
      // Make sure adapter supports signing
      if (!wallet?.adapter || !("sendTransaction" in wallet.adapter)) {
        toast.error("Connected wallet can't send transactions");
        return;
      }
      if (!signTransaction) {
        toast.error("Wallet does not support signing transactions directly");
        return;
      }

      console.log("how about this program id", program.programId.toBase58());
      const signedTx = await signTransaction(tx);
      const sig = await connection.sendRawTransaction(signedTx.serialize());

      await connection.confirmTransaction(
        { signature: sig, blockhash, lastValidBlockHeight },
        "confirmed",
      );

      toast.success(`Gun purchased: ${gun.name} (${sig.slice(0, 8)}…)`);
    } catch (err: any) {
      console.error("🚨 Transaction failed", err?.logs ?? err);
      toast.error("Gun purchase failed – see console for details");
    }
  }

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* 🔽 Background Image (fixed behind content) */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/arsenal/arsenal_bg.png"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="relative z-10">
        <Dialog
          open={isModalOpen}
          onClose={closeModal}
          className="fixed z-10 inset-0 overflow-y-auto"
        >
          <div className="flex items-center justify-center min-h-screen">
            <div className="bg-white p-6 rounded shadow-lg">
              <Dialog.Title className="text-lg font-bold">
                Confirm Purchase
              </Dialog.Title>
              <Dialog.Description className="mt-2">
                Are you sure you want to purchase this gun?
              </Dialog.Description>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmPurchase}
                  className="px-4 py-2 bg-green-500 text-white rounded"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </Dialog>
        <div className="container mx-auto p-4">
          <div className="flex flex-col items-center mb-12">
            {randomQuote && (
              <div className="flex items-center gap-2 bg-white/70 p-2 rounded-md shadow-sm">
                <h1
                  className={`font-bold mb-2 text-center text-green-800 bg-clip-text font-mono tracking-wider italic ${
                    randomQuote.quote.length > 50 ? "text-3xl" : "text-4xl"
                  }`}
                >
                  &ldquo;{randomQuote.quote}&rdquo;
                </h1>
                <button
                  onClick={handleRefresh}
                  className="text-gray-500 hover:text-gray-400 transition-colors"
                >
                  <svg
                    className={`w-6 h-6 ${isRefreshing ? "animate-spin" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
              </div>
            )}
            {randomQuote && (
              <p className="text-lg text-gray-400 italic mb-4">
                - {randomQuote.author}
              </p>
            )}
            <div className="h-1 w-24 bg-gradient-to-r from-green-400 to-green-600 rounded-full"></div>
          </div>

          <div className="relative flex justify-center mb-12">
            <div
              ref={tabsRef}
              className="relative flex bg-gray-800/50 rounded-xl p-2"
            >
              <div
                className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-800 rounded-xl transition-all duration-300"
                style={{
                  width: "calc(120px + 15px)",
                  transform: `translateX(${sliderPosition}px)`,
                }}
              />
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveTab("shop")}
                  className={`relative w-[120px] py-3 rounded-xl font-bold transition-all duration-300 z-10 ${
                    activeTab === "shop"
                      ? "text-white"
                      : "text-gray-400 hover:text-green-800"
                  }`}
                >
                  Shop
                </button>
                <button
                  onClick={() => setActiveTab("your-guns")}
                  className={`relative w-[120px] py-3 rounded-xl font-bold transition-all duration-300 z-10 ${
                    activeTab === "your-guns"
                      ? "text-white"
                      : "text-gray-400 hover:text-green-800"
                  }`}
                >
                  Your Guns
                </button>
                <button
                  onClick={() => setActiveTab("leaderboard")}
                  className={`relative w-[120px] py-3 rounded-xl font-bold transition-all duration-300 z-10 ${
                    activeTab === "leaderboard"
                      ? "text-white"
                      : "text-gray-400 hover:text-green-800"
                  }`}
                >
                  Leaderboard
                </button>
              </div>
            </div>
          </div>

          {activeGun && (
            <div className="text-center text-white text-xl mb-4">
              Now Using: {activeGun.name}
            </div>
          )}

          {!publicKey ? (
            <div className="text-center p-12 bg-gradient-to-br from-yellow-400/10 to-yellow-600/10 rounded-2xl border border-yellow-500/20">
              <p className="text-yellow-300 text-xl font-medium">
                Connect your wallet to view your arsenal
              </p>
            </div>
          ) : (
            <>
              {activeTab === "shop" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sniperData.sniper.map((gun, index) => (
                    <div
                      key={index}
                      className="transform transition-all duration-300 hover:scale-105"
                      onClick={() => openModal(index)}
                    >
                      <div className="relative h-[450px] w-[350px] mx-auto bg-gradient-to-br from-green-900/90 to-green-800/90 rounded-2xl shadow-lg shadow-green-500/20 border-2 border-green-600/30">
                        <div className="absolute inset-4">
                          <Image
                            src={`/rifles/${gun.name.toLowerCase().replace(/\s+/g, "_")}.png`}
                            alt={gun.name}
                            fill
                            className="object-contain transition-transform duration-300 hover:scale-110"
                          />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent rounded-b-2xl">
                          <h3 className="text-2xl font-bold text-white">
                            {gun.name}
                          </h3>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "your-guns" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ownedNFTs.length > 0 ? (
                    ownedNFTs.map((gun, index) => (
                      <div
                        key={index}
                        onClick={() => handleSelectGun(gun)}
                        className={`transform transition-all duration-300 hover:scale-105 cursor-pointer ${
                          activeGun?.mint === gun.mint
                            ? "ring-4 ring-green-400"
                            : ""
                        }`}
                      >
                        <div className="relative h-[450px] w-[350px] mx-auto bg-gradient-to-br from-gray-900/90 to-gray-800/90 rounded-2xl shadow-lg shadow-gray-500/20 border-2 border-gray-600/30">
                          <div className="absolute inset-4">
                            <Image
                              src={`/rifles/${gun.name.toLowerCase().replace(/\s+/g, "_")}.png`}
                              alt={gun.name}
                              fill
                              className="object-contain transition-transform duration-300 hover:scale-110"
                            />
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent rounded-b-2xl">
                            <h3 className="text-2xl font-bold text-white">
                              {gun.name}
                            </h3>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center p-12 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border-2 border-gray-700/50">
                      <p className="text-2xl text-gray-300 font-medium">
                        No guns found in your wallet
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "leaderboard" && (
                <div className="text-center p-12 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl border-2 border-gray-700/50">
                  <p className="text-2xl text-gray-300 font-medium">
                    Leaderboard coming soon
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

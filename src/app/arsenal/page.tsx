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
import { getNftsForWallet, getBadgesForWallet } from "../utils/helper";
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
import { useRouter } from "next/navigation";
// import { FaceFrownIcon } from '@heroicons/react/24/outline'

export default function ArsenalPage() {
  const { wallet, signTransaction, publicKey } = useWallet();
  const [activeTab, setActiveTab] = useState<
    "shop" | "your-guns" | "badges"
  >("your-guns");
  const [sliderPosition, setSliderPosition] = useState(0);
  const tabsRef = useRef<HTMLDivElement>(null);
  const [randomQuote, setRandomQuote] = useState<{
    quote: string;
    author: string;
  } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [ownedNFTs, setOwnedNFTs] = useState<any[]>([]);
  const [ownedBadges, setOwnedBadges] = useState<any[]>([]);

  const [activeGun, setActiveGun] = useState<any | null>(null);
  const { program, provider } = useHeadlinedProgram();
  const [matchStats, setMatchStats] = useState<{ participated: boolean; kills: number }>({
    participated: false,
    kills: 0
  });

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
    sessionStorage.setItem("selectedGun", JSON.stringify(gun));

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
    console.log("wallet object:", wallet);
    console.log("wallet.adapter:", wallet?.adapter);
    console.log("publicKey:", publicKey?.toBase58());
  }, [wallet, publicKey]);

  useEffect(() => {
    console.log("Active Gun:", activeGun);
    if (activeGun) {
      sessionStorage.setItem("selectedGun", JSON.stringify(activeGun));
    }
  }, [activeGun]);

  useEffect(() => {
    const savedGun = sessionStorage.getItem("selectedGun");
    if (savedGun) {
      const parsedGun = JSON.parse(savedGun);
      setActiveGun(parsedGun);
    }
  }, []);

  // Fetch owned NFTs that belong to the collections
  useEffect(() => {
    async function fetchOwnedNFTs() {
      if (!publicKey) return;
      try {
        // Fetch guns
        const nfts = await getNftsForWallet(publicKey, connection, 'guns');
        setOwnedNFTs(nfts);

        // Fetch badges
        const badges = await getBadgesForWallet(publicKey, connection);
        setOwnedBadges(badges);
        console.log("Owned badges:", badges);
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
    const collections = await fetch("/data/collection_addresses_2.json"); //convert to json
    const guns = await fetch("/data/arweave_links.json");

    const collectionData = await collections.json();
    const gunData = await guns.json();

    const collection = collectionData.collections[0];
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
          pubkey: collectionAuthorityPda,
          isWritable: false,
          isSigner: false,
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
    const latest = await connection.getLatestBlockhash("confirmed");
    tx.recentBlockhash = latest.blockhash;
    tx.lastValidBlockHeight = latest.lastValidBlockHeight;

    // Sign with local keypair (e.g. gunMint)
    tx.partialSign(gunMint);

    // Manually simulate (optional, for debugging)
    try {

      if (!signTransaction) {
        toast.error("Incompatible Wallet");
        return;
      }

      const signedTx = await signTransaction(tx);

      const sig = await connection.sendRawTransaction(signedTx.serialize());

      await connection.confirmTransaction({
        signature: sig,
        blockhash: latest.blockhash,
        lastValidBlockHeight: latest.lastValidBlockHeight,
      }, "confirmed");

      toast.success(`Gun purchased: ${gun.name} (${sig.slice(0, 8)}…)`);

    } catch (err: any) {
      console.error("🚨 Transaction failed", err?.logs ?? err);
      toast.error("Gun purchase failed – see console for details");
    }
  }

  const [unlockedBadges, setUnlockedBadges] = useState<number[]>([]); // No badges unlocked by default

  // Badge kill thresholds
  const badgeKillThresholds = {
    1: 20,
    2: 35,
    3: 50
  };

  // Badge descriptions
  const badgeDescriptions = {
    1: "A beginner's gleam glints from your scope. Record 20 eliminations in one match to mint this badge.",
    2: "The sky bleeds red, afraid of your increased performance. Record 35 eliminations in one match to mint this badge.",
    3: "By sunset, few of your enemies remain. Record 50 eliminations in one match to mint this badge."
  };

  // Badge names
  const badgeNames = {
    1: "Bronze Horizon",
    2: "Crimson Eclipse",
    3: "Silent Sundown"
  };

  // Function to check if the user owns a specific badge
  const userOwnsBadge = (badgeNum: number) => {
    // Check if any of the owned badges has a name that matches the badge number
    return ownedBadges.some(badge => badge.name === badgeNames[badgeNum as keyof typeof badgeNames]);
  };

  // Function to render a badge with proper styling based on unlocked status
  const renderBadge = (badgeNum: number) => {
    const isUnlocked = unlockedBadges.includes(badgeNum);
    const killThreshold = badgeKillThresholds[badgeNum as keyof typeof badgeKillThresholds];
    const hasMetKillThreshold = matchStats.kills >= killThreshold;
    const isMinted = userOwnsBadge(badgeNum);

    // Treat minted badges as if they were unlocked for display purposes
    const effectivelyUnlocked = isUnlocked || isMinted;

    return (
      <div key={badgeNum} className="flex flex-col items-center h-full">
        <div className={`relative group mb-4 ${effectivelyUnlocked ? 'animate-pulse-subtle' : ''}`}>
          {/* Dark overlay for locked badges */}
          {!effectivelyUnlocked && (
            <div className="absolute inset-0 bg-black/70 rounded-full group-hover:bg-black/60 transition-all z-10"></div>
          )}
          <div className={`relative p-2 ${effectivelyUnlocked ? 'bg-gradient-to-br from-green-900/40 to-green-700/40' : 'bg-gradient-to-br from-gray-700/30 to-gray-900/30'} rounded-xl ${effectivelyUnlocked ? 'border border-green-500/50 shadow-green-500/30 shadow-lg' : 'border border-green-800/30 shadow-lg'} overflow-hidden`}>
            <div className="w-48 h-48 md:w-56 md:h-56 relative">
              <Image
                src={`/badges/badge_${badgeNum}.png`}
                alt={`Achievement Badge ${badgeNum}`}
                fill
                className={`object-contain ${!effectivelyUnlocked ? 'filter grayscale' : ''}`}
              />
            </div>
            <div className={`absolute bottom-0 left-0 right-0 p-2 ${effectivelyUnlocked ? 'bg-green-900/70' : 'bg-black/70'} text-center`}>
              <p className={`${effectivelyUnlocked ? 'text-green-300' : 'text-gray-400'} font-bold`}>
                {isMinted ? 'Minted' : isUnlocked ? 'Unlocked' : 'Locked'}
              </p>
            </div>
          </div>

          {/* Badge overlay with military-style accents - brighter for unlocked badge */}
          <div className={`absolute top-1 left-1 w-6 h-6 border-t-2 border-l-2 ${effectivelyUnlocked ? 'border-green-400' : 'border-green-500/50'} rounded-tl-lg z-20`}></div>
          <div className={`absolute top-1 right-1 w-6 h-6 border-t-2 border-r-2 ${effectivelyUnlocked ? 'border-green-400' : 'border-green-500/50'} rounded-tr-lg z-20`}></div>
          <div className={`absolute bottom-1 left-1 w-6 h-6 border-b-2 border-l-2 ${effectivelyUnlocked ? 'border-green-400' : 'border-green-500/50'} rounded-bl-lg z-20`}></div>
          <div className={`absolute bottom-1 right-1 w-6 h-6 border-b-2 border-r-2 ${effectivelyUnlocked ? 'border-green-400' : 'border-green-500/50'} rounded-br-lg z-20`}></div>

          {/* Glow effect for unlocked or minted badge */}
          {effectivelyUnlocked && (
            <div className="absolute inset-0 -m-1 bg-green-500/20 blur-md rounded-full z-5"></div>
          )}

          {/* Special badge for minted badges */}
          {isMinted && (
            <div className="absolute -top-3 -right-3 bg-yellow-500 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full z-30 transform rotate-12 shadow-lg border border-yellow-600">
              MINTED
            </div>
          )}
        </div>

        {/* Container for status elements with fixed height */}
        <div className="flex flex-col items-center h-24 justify-between">
          {/* Only show checkbox for locked badges that are not minted */}
          {!effectivelyUnlocked && !isMinted && (
            <div className="flex items-center justify-center">
              <label className="inline-flex items-center cursor-pointer">
                <div className={`h-5 w-5 flex items-center justify-center rounded border ${hasMetKillThreshold ? 'bg-green-600 border-green-700' : 'bg-gray-700 border-gray-600'}`}>
                  {hasMetKillThreshold && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className="ms-2 text-sm font-medium text-gray-300">Can Mint</span>
              </label>
            </div>
          )}

          {/* Only show mint button if not minted yet and has met kill threshold */}
          {!isMinted && hasMetKillThreshold && (
            <button
              onClick={() => buyBadge(badgeNum - 1)}
              className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white font-medium rounded-md shadow-lg transition-all border border-green-500/50"
            >
              Mint Badge
            </button>
          )}

          {/* For minted badges, show the badge name in fancy text */}
          {isMinted && (
            <div className="px-4 py-2 bg-yellow-800/40 text-center rounded-md shadow-lg border border-yellow-600/50">
              <h3 className="text-yellow-300 font-serif font-bold tracking-wide">
                {badgeNames[badgeNum as keyof typeof badgeNames]}
              </h3>
            </div>
          )}
        </div>

        {/* Badge description */}
        <div className="mt-2 px-4 text-center">
          <p className="text-sm text-gray-400 italic line-clamp-3 hover:line-clamp-none">
            {badgeDescriptions[badgeNum as keyof typeof badgeDescriptions]}
          </p>
        </div>
      </div>
    );
  };

  // Function to mint/purchase a badge
  async function buyBadge(index: number) {
    if (!publicKey) {
      toast.error("Connect your wallet to mint a badge");
      return;
    }

    console.log(program.programId.toBase58());
    const collections = await fetch("/data/badge.json");
    const badges = await fetch("/data/individual_badges.json");

    const collectionData = await collections.json();
    const badgeData = await badges.json();

    const collection = collectionData.collections[0];
    const badge = badgeData.badges[index];

    const badgePrice = 0.01 * LAMPORTS_PER_SOL; // Lower price for badges compared to guns

    console.log(collection);
    console.log(badge);

    const collectionMint = new PublicKey(collection.collectionMint);
    const collectionMetadata = new PublicKey(collection.collectionMetadata);
    const collectionMasterEdition = new PublicKey(
      collection.collectionMasterEdition,
    );

    const badgeMint = Keypair.generate();
    const lamports = await connection.getMinimumBalanceForRentExemption(
      MintLayout.span,
    );

    const paymentIx = SystemProgram.transfer({
      fromPubkey: publicKey,
      toPubkey: devWallet,
      lamports: badgePrice,
    });

    const createMintIx = SystemProgram.createAccount({
      fromPubkey: publicKey,
      newAccountPubkey: badgeMint.publicKey,
      space: MintLayout.span,
      lamports,
      programId: TOKEN_PROGRAM_ID,
    });

    const mintIxInit = createInitializeMint2Instruction(
      badgeMint.publicKey,
      0,
      publicKey,
      publicKey,
      TOKEN_PROGRAM_ID,
    );
    const ata = await getAssociatedTokenAddress(badgeMint.publicKey, publicKey);
    const ataIx = createAssociatedTokenAccountInstruction(
      publicKey,
      ata,
      publicKey,
      badgeMint.publicKey,
    );

    const mintToIx = createMintToInstruction(
      badgeMint.publicKey,
      ata,
      publicKey,
      1,
    );

    const [metadataPda, metadataBump] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        MPL_TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        badgeMint.publicKey.toBuffer(),
      ],
      MPL_TOKEN_METADATA_PROGRAM_ID,
    );

    const [masterEditionPda, masterEditionBump] =
      PublicKey.findProgramAddressSync(
        [
          Buffer.from("metadata"),
          MPL_TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          badgeMint.publicKey.toBuffer(),
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
      .mint(badge.name, collection.symbol, badge.metadata_link)
      .accounts({
        payer: publicKey,
        mint: badgeMint.publicKey,
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
          pubkey: collectionAuthorityPda,
          isWritable: false,
          isSigner: false,
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
    const latest = await connection.getLatestBlockhash("confirmed");
    tx.recentBlockhash = latest.blockhash;
    tx.lastValidBlockHeight = latest.lastValidBlockHeight;

    // Sign with local keypair (e.g. badgeMint)
    tx.partialSign(badgeMint);

    try {
      if (!signTransaction) {
        toast.error("Incompatible Wallet");
        return;
      }

      const signedTx = await signTransaction(tx);

      const sig = await connection.sendRawTransaction(signedTx.serialize());

      await connection.confirmTransaction({
        signature: sig,
        blockhash: latest.blockhash,
        lastValidBlockHeight: latest.lastValidBlockHeight,
      }, "confirmed");

      toast.success(`Badge minted: ${badge.name} (${sig.slice(0, 8)}…)`);

      // Immediately add the badge to ownedBadges state to update UI without refresh
      const newMintedBadge = {
        name: badge.name,
        mint: badgeMint.publicKey.toString(),
        type: 'badges',
        symbol: collection.symbol
      };
      setOwnedBadges([...ownedBadges, newMintedBadge]);

      // Unlock the badge after successful minting
      if (!unlockedBadges.includes(index + 1)) {
        setUnlockedBadges([...unlockedBadges, index + 1]);
      }

    } catch (err: any) {
      console.error("🚨 Transaction failed", err?.logs ?? err);
      toast.error("Badge minting failed – see console for details");
    }
  }

  // Function to unlock the next badge in sequence
  const unlockNextBadge = () => {
    if (unlockedBadges.length === 0) {
      // Unlock badge 1
      setUnlockedBadges([1]);
    } else if (unlockedBadges.length === 1 && unlockedBadges.includes(1)) {
      // Unlock badge 2
      setUnlockedBadges([1, 2]);
    } else if (unlockedBadges.length === 2 && unlockedBadges.includes(2)) {
      // Unlock badge 3
      setUnlockedBadges([1, 2, 3]);
    } else {
      // Reset to no badges
      setUnlockedBadges([]);
    }
  };

  useEffect(() => {
    // Get match results from sessionStorage
    const getMatchResults = () => {
      if (typeof window !== 'undefined' && publicKey) {
        const matchResults = sessionStorage.getItem('matchResults');
        if (matchResults) {
          try {
            const matchData = JSON.parse(matchResults);
            const userPublicKey = publicKey.toBase58();

            // Check if user was walletA or walletB
            if (matchData.walletA === userPublicKey) {
              const kills = matchData.a_kills || 0;
              setMatchStats({ participated: kills > 0, kills });
            } else if (matchData.walletB === userPublicKey) {
              const kills = matchData.b_kills || 0;
              setMatchStats({ participated: kills > 0, kills });
            } else {
              setMatchStats({ participated: false, kills: 0 });
            }
          } catch (error) {
            console.error("Error parsing match results:", error);
            setMatchStats({ participated: false, kills: 0 });
          }
        }
      }
    };

    getMatchResults();
  }, [publicKey]);

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
            <div className="bg-black/80 p-6 rounded shadow-lg border border-green-500 max-w-md w-full">
              <Dialog.Title className="text-xl font-bold text-green-400">
                Confirm Purchase
              </Dialog.Title>
              <Dialog.Description className="mt-2 text-white">
                Are you sure you want to purchase this gun?
              </Dialog.Description>

              <div className="mt-4 bg-yellow-900/50 p-3 rounded border border-yellow-600">
                <h3 className="text-yellow-400 font-semibold mb-1">Important Notes:</h3>
                <ul className="list-disc pl-5 space-y-1 text-yellow-200 text-sm">
                  <li><span className="font-bold">Phantom Users:</span> Ignore any red simulation warnings - this is normal for NFT minting.</li>
                  <li><span className="font-bold">All sales are final.</span> No refunds available for purchased weapons.</li>
                  <li>After purchase, please refresh and check the <span className="italic">"Your Guns"</span> tab to select your new weapon for battle.</li>
                </ul>
              </div>

              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmPurchase}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Confirm Purchase
                </button>
              </div>
            </div>
          </div>
        </Dialog>
        <div className="container mx-auto p-4">
          <div className="flex flex-col items-center mb-12">
            {randomQuote && (
              <div className="relative w-full max-w-3xl">
                {/* Military-style quote container with fixed dimensions */}
                <div className="relative py-6 px-8 bg-black/60 border-l-4 border-green-500 shadow-lg transform h-[180px] flex flex-col justify-between">
                  {/* Top-left corner accent */}
                  <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-green-500"></div>
                  {/* Bottom-right corner accent */}
                  <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-green-500"></div>

                  <div className="overflow-hidden flex items-center h-[100px]">
                    <h1
                      className={`font-mono tracking-wide italic text-green-400 ${randomQuote.quote.length > 100
                        ? "text-xl"
                        : randomQuote.quote.length > 70
                          ? "text-2xl"
                          : randomQuote.quote.length > 50
                            ? "text-3xl"
                            : "text-4xl"
                        }`}
                    >
                      &ldquo;{randomQuote.quote}&rdquo;
                    </h1>
                  </div>

                  <div className="flex justify-between items-center mt-2">
                    <p className="text-lg text-green-300 italic font-mono">
                      — {randomQuote.author}
                    </p>
                    <button
                      onClick={handleRefresh}
                      className="text-green-500 hover:text-green-300 transition-all duration-300 transform hover:rotate-180"
                    >
                      <svg
                        className={`w-7 h-7 ${isRefreshing ? "animate-spin" : ""}`}
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
                </div>

                {/* Ammo decoration */}
                <div className="absolute -right-4 -top-4 w-8 h-24 flex flex-col gap-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-full h-6 bg-gradient-to-r from-yellow-700 to-yellow-500 rounded-sm"></div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative flex justify-center mb-12">
            {/* Flashing price tag - only shows when shop tab is active */}
            {activeTab === "shop" && (
              <div className="absolute -top-16 -left-10 z-20">
                <div className="relative w-48 h-28 transform -rotate-12 overflow-visible">
                  {/* Spiky jagged edge background */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 160 90">
                    <path
                      d="M80,5 
                         L95,0 L105,10 L120,5 L125,20 L140,25 L130,40 L145,55 
                         L125,60 L130,75 L110,70 L100,85 L80,75 
                         L60,85 L50,70 L30,75 L35,60 L15,55 L30,40 L20,25 
                         L35,20 L40,5 L55,10 L65,0 Z"
                      fill="#F9CD2E"
                      stroke="#FF6B00"
                      strokeWidth="2"
                      className="animate-pulse"
                    />
                  </svg>

                  {/* Inner content */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="absolute inset-0 bg-yellow-500 animate-ping opacity-30"></div>
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="transform rotate-0 font-extrabold text-red-600 text-center leading-tight drop-shadow-md">
                        <div className="text-4xl font-black">0.05</div>
                        <div className="text-2xl">SOL</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                  className={`relative w-[120px] py-3 rounded-xl font-bold transition-all duration-300 z-10 ${activeTab === "shop"
                    ? "text-white"
                    : "text-gray-400 hover:text-green-800"
                    }`}
                >
                  Shop
                </button>
                <button
                  onClick={() => setActiveTab("your-guns")}
                  className={`relative w-[120px] py-3 rounded-xl font-bold transition-all duration-300 z-10 ${activeTab === "your-guns"
                    ? "text-white"
                    : "text-gray-400 hover:text-green-800"
                    }`}
                >
                  Your Guns
                </button>
                <button
                  onClick={() => setActiveTab("badges")}
                  className={`relative w-[120px] py-3 rounded-xl font-bold transition-all duration-300 z-10 ${activeTab === "badges"
                    ? "text-white"
                    : "text-gray-400 hover:text-green-800"
                    }`}
                >
                  Badges
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
                        className={`transform transition-all duration-300 hover:scale-105 cursor-pointer ${activeGun?.mint === gun.mint
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

              {activeTab === "badges" && (
                <div className="p-8 bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl border border-green-700/50">
                  <h2 className="text-2xl text-green-400 font-bold mb-6 text-center">Achievement Badges</h2>

                  {/* Match Stats Box in badges tab */}
                  <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border border-green-600/50 rounded-lg p-4 shadow-lg mb-6 max-w-xs mx-auto">
                    <h3 className="text-green-400 text-base font-bold mb-2 text-center">Last Match Stats</h3>
                    <div className="text-center">
                      {!publicKey ? (
                        <p className="text-yellow-300 text-sm">Connect wallet to view stats</p>
                      ) : !matchStats.participated ? (
                        <p className="text-yellow-300">Play a match first</p>
                      ) : (
                        <div className="flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-red-400 font-bold text-2xl">{matchStats.kills}</span>
                          <span className="ml-1 text-gray-300 text-sm">kills</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row justify-center items-start gap-8">
                    {[1, 2, 3].map((badgeNum) => renderBadge(badgeNum))}
                  </div>

                  <div className="mt-8 text-center p-3 bg-black/40 border border-yellow-600/30 rounded">
                    <p className="text-yellow-300/80 italic">Only after a glorious victory can you mint your badge!</p>
                  </div>

                  {/* For testing - a button to unlock badges in sequence */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="mt-4 text-center">
                      <button
                        onClick={unlockNextBadge}
                        className="px-3 py-1 bg-gray-700 text-gray-300 text-xs rounded hover:bg-gray-600"
                      >
                        Dev: Unlock Next Badge ({unlockedBadges.length === 0 ? "1" :
                          unlockedBadges.length === 1 ? "2" :
                            unlockedBadges.length === 2 ? "3" : "Reset"})
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {publicKey && (
        <div
          style={{
            position: "fixed",
            bottom: 10,
            right: 10,
            fontSize: "12px",
            fontFamily: "monospace",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            color: "white",
            padding: "4px 8px",
            borderRadius: "4px",
            zIndex: 10000,
          }}
        >
          Wallet: {publicKey.toBase58().slice(0, 4)}...
          {publicKey.toBase58().slice(-4)}
        </div>
      )}

    </div>
  );
}

"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { WalletButton } from "@/components/solana/solana-provider";
import { useWallet } from "@solana/wallet-adapter-react";

export default function LandingPage() {
  const [showWelcome, setShowWelcome] = useState(false);
  const router = useRouter();
  const { publicKey } = useWallet();

  const handleGetStarted = () => {
    setShowWelcome(true);
  };

  const handleEnterProgram = () => {
    router.push("/");
  };

  return (
    <div className="relative w-full h-screen">
      <Image
        src="/landing/landing_bg.png"
        alt="Headlined Platform"
        fill
        className="object-cover z-0"
        priority
      />
      {showWelcome ? (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h1 className="text-2xl mb-4">Welcome to Headlined!</h1>
            <p className="mb-4">Connect your wallet to get started.</p>
            <WalletButton />
            {publicKey && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEnterProgram();
                }}
                className="mt-4 btn btn-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Enter
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleGetStarted();
            }}
            className="font-bold text-black bg-transparent"
          >
            [Get Started]
          </button>
        </div>
      )}
    </div>
  );
}

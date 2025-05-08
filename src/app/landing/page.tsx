"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { WalletButton } from "@/components/solana/solana-provider";
import { useWallet } from "@solana/wallet-adapter-react";
import { supabase } from "../utils/supabaseClient";
import { disconnectSocket } from "../utils/socket";


export default function LandingPage() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);

  const { publicKey } = useWallet();
  const router = useRouter();

  const handleGetStarted = () => setShowWelcome(true);
  const handleEnterProgram = async () => {
    if (!publicKey) return;

    const walletAddress = publicKey.toBase58();

    // 1. Check if the address already exists
    const { data, error: fetchError } = await supabase
      .from('waitlist')
      .select('address')
      .eq('address', walletAddress)
      .single(); // Only expect 0 or 1 record

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error checking waitlist:', fetchError);
      return;
    }

    if (data) {
      // Already on waitlist — just allow them to proceed
      router.push("/");
      return;
    }

    // 2. Insert if not found
    const { error: insertError } = await supabase
      .from('waitlist')
      .insert([
        {
          address: walletAddress,
          signed_up_at: new Date().toISOString(),
        },
      ]);

    if (insertError) {
      console.error('Error inserting into waitlist:', insertError);
      return;
    }

    // 3. Success
    router.push("/");
  };


  /* ──────────────────────────────────────────────────────────
     Keep our local flag in sync with the wallet state
  ────────────────────────────────────────────────────────────*/
  useEffect(() => {
    setWalletConnected(!!publicKey);
  }, [publicKey]);

  /* ──────────────────────────────────────────────────────────
     If the user *was* connected but now isn’t, reset everything
     so they must hit “Get Started” again.
  ────────────────────────────────────────────────────────────*/
  useEffect(() => {
    if (!publicKey && walletConnected) {
      // Wallet just disconnected
      setConsentGiven(false);
      setShowWelcome(false);
      setWalletConnected(false);

      /* Optional: uncomment if you’d rather force-refresh the route
         instead of only resetting local state.
         router.replace("/landing");
      */
    }
  }, [publicKey, walletConnected]);

  return (
    <div className="relative w-full h-screen">
      <Image
        src="/landing/landing_bg.png"
        alt="Headlined Platform"
        fill
        className="object-cover z-0"
        priority
      />

      {/* “Get Started” button */}
      {!showWelcome && (
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

      {/* Welcome / wallet-connect modal */}
      {showWelcome && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="bg-white/20 backdrop-blur-lg border border-white/30 p-10 rounded-3xl shadow-2xl text-center animate-fadeInUp w-[90%] max-w-md">
            <h1 className="text-4xl font-extrabold text-white mb-6 tracking-wide">
              Welcome to Headlined!
            </h1>
            <p className="text-lg text-white/80 mb-8">
              You&apos;ll need a Solana wallet to access the platform. Please connect one now.

            </p>

            <div className="mb-6">
              <WalletButton />
            </div>

            {/* Consent checkbox + “Enter” only after wallet connects */}
            {walletConnected && (
              <div className="flex flex-col items-center space-y-4">
                <label className="flex items-center text-white space-x-3 text-sm">
                  <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="w-5 h-5 text-green-500 bg-gray-100 border-gray-300 rounded focus:ring-green-400 focus:ring-2"
                  />
                  <span>I agree to be put on the waitlist for beta access.</span>
                </label>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (consentGiven) handleEnterProgram();
                  }}
                  disabled={!consentGiven}
                  className={`px-8 py-4 ${consentGiven
                      ? "bg-gradient-to-br from-green-400 to-blue-600 hover:from-green-500 hover:to-blue-700"
                      : "bg-gray-400 cursor-not-allowed"
                    } text-white font-bold rounded-2xl text-xl shadow-lg hover:shadow-2xl transition-all duration-300`}
                >
                  Enter the Platform
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

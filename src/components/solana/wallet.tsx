"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useMemo } from "react";

export default function CustomWalletButton() {
  const { connected, connecting, publicKey, connect, disconnect } = useWallet();

  const displayAddress = useMemo(() => {
    if (!publicKey) return "";
    return `${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`;
  }, [publicKey]);

  const handleClick = async () => {
    try {
      if (!connected) {
        await connect();
      } else {
        await disconnect();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="px-6 py-3 bg-gradient-to-br from-green-400 to-blue-600 hover:from-green-500 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 text-lg"
    >
      {connecting
        ? "Connecting..."
        : connected
          ? `Connected: ${displayAddress}`
          : "Connect Wallet"}
    </button>
  );
}

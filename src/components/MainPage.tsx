"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  connectSocket,
  disconnectSocket,
  getSocket,
} from "../app/utils/socket";
import { WalletButton } from "@/components/solana/solana-provider";
import { supabase } from "../app/utils/supabaseClient";

const MainPage: React.FC = () => {
  const router = useRouter();
  const { publicKey } = useWallet();

  const [activeGun, setActiveGun] = useState<{ name: string } | null>(null);
  const [isMatchmakingOpen, setIsMatchmakingOpen] = useState(false);
  const [matchFound, setMatchFound] = useState(false);
  const [opponent, setOpponent] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);
  const countdownRef = React.useRef<NodeJS.Timeout | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<number>(0);
  const [consentGiven, setConsentGiven] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showIntroScroll, setShowIntroScroll] = useState(false);
  const [showJoinMatchInfo, setShowJoinMatchInfo] = useState(false);
  const [showExamples, setShowExamples] = useState(false);

  useEffect(() => {
    if (publicKey) {
      // Check if user is on waitlist when wallet connects
      const checkWaitlist = async () => {
        const walletAddress = publicKey.toBase58();

        const { data, error: fetchError } = await supabase
          .from("waitlist")
          .select("address")
          .eq("address", walletAddress)
          .single();

        if (fetchError && fetchError.code !== "PGRST116") {
          console.error("Error checking waitlist:", fetchError);
          return;
        }

        if (!data) {
          // Not on waitlist - add them
          const { error: insertError } = await supabase
            .from("waitlist")
            .insert([
              {
                address: walletAddress,
                signed_up_at: new Date().toISOString(),
              },
            ]);

          if (insertError) {
            console.error("Error inserting into waitlist:", insertError);
            return;
          }
        }
      };

      checkWaitlist();
    }
  }, [publicKey]);

  useEffect(() => {
    const socket = getSocket();

    const handleUserCount = (count: number) => {
      setOnlineUsers(count);
    };

    socket.on("user_count", handleUserCount);
    socket.emit("get_user_count");

    return () => {
      socket.off("user_count", handleUserCount);
    };
  }, []);

  useEffect(() => {
    const savedGun = sessionStorage.getItem("selectedGun");
    if (savedGun) {
      setActiveGun(JSON.parse(savedGun));
    } else {
      // Set default gun if none is selected
      const defaultGun = { name: "Default Sniper" };
      sessionStorage.setItem("selectedGun", JSON.stringify(defaultGun));
      setActiveGun(defaultGun);
    }
  }, []);

  const handlePracticeClick = () => {
    router.push("/lobby");
  };

  const handleJoinMatch = () => {
    setShowJoinMatchInfo(true);
  };

  const handleNext = () => {
    setShowJoinMatchInfo(false);
    setShowExamples(true);
  };

  const handleStartMatchmaking = () => {
    setShowExamples(false);
    const socket = getSocket();

    if (!publicKey) {
      console.error("No wallet connected!");
      return;
    }

    sessionStorage.removeItem("matchSeed");
    sessionStorage.removeItem("matchId");

    setIsMatchmakingOpen(true);

    socket.emit("join_matchmaking", { walletAddress: publicKey.toString() });

    socket.on(
      "match_found",
      ({
        roomId,
        seed,
        opponent,
      }: {
        roomId: string;
        seed: string;
        opponent: string;
      }) => {
        // Store match data
        sessionStorage.setItem("matchSeed", seed);
        sessionStorage.setItem("matchId", roomId);

        // Show countdown overlay
        setOpponent(opponent);
        setMatchFound(true);
        setCountdown(5);

        // Clear any existing countdown
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
        }

        // Start countdown interval
        countdownRef.current = setInterval(() => {
          setCountdown((prev) => {
            if (prev === 1) {
              clearInterval(countdownRef.current!);
              router.push(`/city/${roomId}`); // Redirect after countdown
            }
            return prev - 1;
          });
        }, 1000);
      },
    );

    socket.on("waiting", ({ message }: { message: string }) => {
      //debug only
    });
  };

  useEffect(() => {
    const socket = getSocket();

    socket.on("user_count", (count) => {
      //debug only
    });

    return () => {
      socket.off("user_count");
    };
  }, []);

  useEffect(() => {
    if (isMatchmakingOpen) {
      // Start zoom animation
      const zoomInterval = setInterval(() => {
        setZoomLevel((prev) => {
          if (prev >= 3) {
            clearInterval(zoomInterval);
            return 3;
          }
          return prev + 0.1;
        });
      }, 50);
      return () => clearInterval(zoomInterval);
    } else {
      setZoomLevel(1);
    }
  }, [isMatchmakingOpen]);

  return (
    <>
      {!publicKey && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="bg-white/20 backdrop-blur-lg border border-white/30 p-10 rounded-3xl shadow-2xl text-center animate-fadeInUp w-[90%] max-w-md">
            <h1 className="text-4xl font-extrabold text-white mb-6 tracking-wide">
              Welcome to Headlined!
            </h1>
            <p className="text-lg text-white/80 mb-8">
              You&apos;ll need a Solana wallet to access the platform. Please
              connect one now.
            </p>

            <div className="mb-6">
              <WalletButton />
            </div>

            {publicKey && (
              <div className="flex flex-col items-center space-y-4">
                <label className="flex items-center text-white space-x-3 text-sm">
                  <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="w-5 h-5 text-green-500 bg-gray-100 border-gray-300 rounded focus:ring-green-400 focus:ring-2"
                  />
                  <span>
                    I agree to be put on the waitlist for beta access.
                  </span>
                </label>
              </div>
            )}
          </div>
        </div>
      )}

      {matchFound && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.8)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100000,
            color: "white",
            fontFamily: "monospace",
            textShadow: "0 0 6px black",
          }}
        >
          <h2 style={{ fontSize: "34px", marginBottom: "18px" }}>
            Match Found!
          </h2>
          <p style={{ fontSize: "20px", marginBottom: "8px" }}>
            Opponent:&nbsp;
            <span style={{ color: "#FFD700" }}>
              {opponent
                ? `${opponent.slice(0, 4)}…${opponent.slice(-4)}`
                : "loading…"}
            </span>
          </p>
          <p style={{ fontSize: "24px" }}>
            Starting in&nbsp;
            <span style={{ color: "#FFA500", fontWeight: "bold" }}>
              {countdown}
            </span>
            …
          </p>
        </div>
      )}

      <div className="min-h-screen bg-gray-900 relative overflow-hidden">
        <img
          src="/city/we_made_it.gif"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            objectFit: "contain",
            zIndex: 0,
            transform: `scale(${zoomLevel})`,
            transition: "transform 0.5s ease-out",
          }}
          alt="Background"
        />

        {isMatchmakingOpen && !matchFound && (
          <div className="absolute inset-0 flex items-center justify-center z-50">
            <div className="bg-red-500/20 backdrop-blur-md border-2 border-red-500 px-8 py-4 rounded-lg animate-pulse">
              <h2 className="text-2xl font-bold text-red-500 text-center">
                Waiting for match...
              </h2>
            </div>
          </div>
        )}

        <div
          style={{
            position: "absolute",
            bottom: "6%",
            right: "30%",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            zIndex: 10,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: "#00FF00",
              boxShadow: "0 0 8px #00FF00",
            }}
          />
          <span
            style={{
              color: "#00FF00",
              fontSize: "14px",
              fontFamily: "monospace",
              textShadow: "0 0 4px black",
            }}
          >
            {onlineUsers} online
          </span>
        </div>

        {publicKey && (
          <div
            style={{
              position: "absolute",
              bottom: "2%",
              right: "30%",
              zIndex: 10,
              pointerEvents: "none",
            }}
          >
            <span
              style={{
                backgroundColor: "rgba(128, 128, 128, 0.3)",
                padding: "4px 8px",
                borderRadius: "4px",
                color: "white",
                fontSize: "12px",
                fontFamily: "'Courier New', monospace",
                letterSpacing: "0.4px",
              }}
            >
              wallet: {publicKey.toString().slice(0, 4)}...
              {publicKey.toString().slice(-4)}
            </span>
          </div>
        )}

        {/* Rain effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-transparent">
          <div className="rain"></div>
        </div>

        {/* LEFT COLUMN */}
        <div className="absolute top-0 left-0 h-screen w-[27%] z-10 flex flex-col pointer-events-auto">
          {/* Arsenal */}
          <Link
            href="/arsenal"
            className="flex-1 group relative overflow-hidden cursor-pointer"
          >
            {/* Panel */}
            <div
              className="sunset-border bg-gray-800/80 backdrop-blur-sm p-6 h-full w-full flex flex-col items-center justify-center
                    transition-all duration-300 ease-out
                    transform
                    group-hover:scale-105 group-hover:rotate-1
                    group-hover:brightness-110
                    group-hover:shadow-[0_0_20px_rgba(255,165,0,0.5)]
                    group-hover:border-[3px]"
            >
              <div className="relative w-full h-full">
                <img
                  src="/city/button_arsenal.png"
                  className="w-full h-full object-cover pointer-events-none"
                  alt="Arsenal"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
                <h2 className="absolute bottom-4 left-4 text-2xl font-bold text-white pointer-events-none">
                  Arsenal
                </h2>

                {activeGun && (
                  <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full pointer-events-none">
                    <p className="text-orange-200 font-mono text-xs">
                      {activeGun.name}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Link>

          {/* Headlines */}
          <Link
            href="/headlines"
            className="flex-1 group relative overflow-hidden cursor-pointer"
          >
            <div
              className="sunset-border bg-gray-800/80 backdrop-blur-sm p-6 h-full w-full flex flex-col items-center justify-center
                    transition-all duration-300 ease-out
                    transform
                    group-hover:scale-105 group-hover:rotate-1
                    group-hover:brightness-110
                    group-hover:shadow-[0_0_20px_rgba(255,165,0,0.5)]
                    group-hover:border-[3px]"
            >
              <div className="relative w-full h-full">
                <img
                  src="/city/button_headlines.png"
                  className="w-full h-full object-cover pointer-events-none"
                  alt="Headlines"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
                <h2 className="absolute bottom-4 left-4 text-2xl font-bold text-white pointer-events-none">
                  Headlines
                </h2>
              </div>
            </div>
          </Link>
        </div>

        {/* Info Icon - Moved outside the left column */}
        <button
          onClick={() => setShowIntroScroll(true)}
          className="absolute top-4 left-[calc(27%+16px)] w-8 h-8 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-full 
                  hover:bg-black/60 transition-all duration-300 group/info z-20"
        >
          <span className="text-white text-lg font-bold group-hover/info:scale-110 transition-transform">
            ⓘ
          </span>
        </button>

        {/* Feature Info Modal */}
        {showIntroScroll && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-gray-900/90 border-2 border-orange-500/50 rounded-xl p-8 max-w-2xl w-[90%] relative">
              <button
                onClick={() => setShowIntroScroll(false)}
                className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
              >
                ✕
              </button>

              <h2 className="text-2xl font-bold text-orange-400 mb-6">
                Game Features
              </h2>

              <div className="space-y-6">
                <div className="bg-black/40 p-4 rounded-lg border border-orange-500/30">
                  <h3 className="text-xl font-bold text-orange-300 mb-2">
                    Arsenal
                  </h3>
                  <p className="text-white/80">
                    Your personal collection of weapons and badges. Customize
                    your loadout and showcase your achievements through unique
                    NFTs.
                  </p>
                </div>

                <div className="bg-black/40 p-4 rounded-lg border border-orange-500/30">
                  <h3 className="text-xl font-bold text-orange-300 mb-2">
                    Practice Match
                  </h3>
                  <p className="text-white/80">
                    Train your skills in a controlled environment. Perfect for
                    learning the mechanics and testing new strategies without
                    the pressure of ranked matches.
                  </p>
                </div>

                <div className="bg-black/40 p-4 rounded-lg border border-orange-500/30">
                  <h3 className="text-xl font-bold text-orange-300 mb-2">
                    Headlines
                  </h3>
                  <p className="text-white/80">
                    Stop by after every live match to stay updated with the
                    latest news, leaderboards, and community highlights. Share a
                    photo and tag us!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Join Match Info Modal */}
        {showJoinMatchInfo && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-gray-900/90 border-2 border-orange-500/50 rounded-xl p-8 max-w-md w-[90%] relative">
              <button
                onClick={() => setShowJoinMatchInfo(false)}
                className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
              >
                ✕
              </button>

              <h2 className="text-2xl font-bold text-orange-400 mb-6">
                Before You Join
              </h2>

              <div className="space-y-4">
                <div className="bg-black/40 p-4 rounded-lg border border-orange-500/30">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full border-2 border-orange-400 flex items-center justify-center text-orange-400 font-bold">
                      1
                    </div>
                    <p className="text-white/80 flex-1">
                      Hold Control to Scope and Click to Shoot
                    </p>
                  </div>
                </div>

                <div className="bg-black/40 p-4 rounded-lg border border-orange-500/30">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full border-2 border-orange-400 flex items-center justify-center text-orange-400 font-bold">
                      2
                    </div>
                    <p className="text-white/80 flex-1">
                      Ensure you have equipped your gun from the arsenal
                    </p>
                  </div>
                </div>

                <div className="bg-black/40 p-4 rounded-lg border border-orange-500/30">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full border-2 border-orange-400 flex items-center justify-center text-orange-400 font-bold">
                      3
                    </div>
                    <p className="text-white/80 flex-1">
                      You may shoot balloons and enemy snipers
                    </p>
                  </div>
                </div>

                <div className="bg-black/40 p-4 rounded-lg border border-orange-500/30">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full border-2 border-orange-400 flex items-center justify-center text-orange-400 font-bold">
                      4
                    </div>
                    <p className="text-white/80 flex-1">
                      It is encouraged to play 1 practice match!
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleNext}
                className="mt-6 w-full bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 font-bold py-3 px-6 rounded-lg border border-orange-500/50 transition-all duration-300"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Examples Modal */}
        {showExamples && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-gray-900/90 border-2 border-orange-500/50 rounded-xl p-8 max-w-2xl w-[90%] relative">
              <button
                onClick={() => setShowExamples(false)}
                className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
              >
                ✕
              </button>

              <h2 className="text-2xl font-bold text-orange-400 mb-6">
                Target Examples
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-orange-300">
                    ✅ Shoot These
                  </h3>
                  <div className="bg-yellow-500/20 p-4 rounded-lg border border-green-500/30">
                    <img
                      src="/figures/balloon.png"
                      alt="Balloon Target"
                      className="w-full h-48 object-contain rounded mb-2"
                    />
                    <p className="text-white/80">
                      Balloons - Pop them for points!
                    </p>
                  </div>
                  <div className="bg-yellow-500/20 p-4 rounded-lg border border-green-500/30">
                    <img
                      src="/figures/evil_sniper_2.png"
                      alt="Enemy Sniper"
                      className="w-full h-48 object-contain rounded mb-2"
                    />
                    <p className="text-white/80">
                      Enemy Snipers - Headshots Only!
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-orange-300">
                    ❌ Do not Shoot These
                  </h3>
                  <div className="bg-yellow-500/20 p-4 rounded-lg border border-red-500/30">
                    <img
                      src="/figures/better_s2.gif"
                      alt="Friendly Target"
                      className="w-full h-48 object-contain rounded mb-2"
                    />
                    <p className="text-white/80">Non-targets -- Civilians</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleStartMatchmaking}
                className="mt-6 w-full bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 font-bold py-3 px-6 rounded-lg border border-orange-500/50 transition-all duration-300"
              >
                Start Matchmaking
              </button>
            </div>
          </div>
        )}

        {/* Right Column */}
        <div className="absolute top-0 right-0 h-screen w-[27%] z-10 flex flex-col pointer-events-auto">
          {/* Join Match */}
          <div
            onClick={handleJoinMatch}
            className="cursor-pointer flex-1 menu-btn group relative overflow-hidden"
          >
            <div className="bg-gray-800/80 backdrop-blur-sm p-6 h-full w-full flex flex-col items-center justify-center sunset-border">
              <div className="relative w-full h-full">
                <img
                  src="/city/live_button.png"
                  className="w-full h-full object-cover"
                  alt="Join Match"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <h2 className="absolute bottom-4 left-4 text-2xl font-bold text-white">
                  Join Match
                </h2>
                {isMatchmakingOpen && (
                  <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full">
                    <p className="text-orange-300 font-mono text-xs animate-pulse">
                      Waiting...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Practice Match */}
          <div
            onClick={handlePracticeClick}
            className="cursor-pointer flex-1 menu-btn group relative overflow-hidden"
          >
            <div className="bg-gray-800/80 backdrop-blur-sm p-6 h-full w-full flex items-center justify-center sunset-border">
              <div className="relative w-full h-full">
                <img
                  src="/city/lobby_button.png"
                  className="w-full h-full object-cover"
                  alt="Practice Match"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <h2 className="absolute bottom-4 left-4 text-2xl font-bold text-white">
                  Practice Match
                </h2>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0.01;
              transform: translateY(40px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes bounceUp {
            0% {
              transform: translateY(100%);
              opacity: 0;
            }
            60% {
              transform: translateY(-20%);
              opacity: 1;
            }
            80% {
              transform: translateY(10%);
            }
            100% {
              transform: translateY(0%);
            }
          }

          @keyframes bounceUpCentered {
            0% {
              transform: translate(-50%, 100%);
              opacity: 0;
            }
            60% {
              transform: translate(-50%, -20%);
              opacity: 1;
            }
            80% {
              transform: translate(-50%, 10%);
            }
            100% {
              transform: translate(-50%, 0%);
            }
          }

          .bounce-up {
            animation: bounceUp 0.9s ease forwards;
          }

          .animate-fadeIn {
            animation: fadeIn 1s ease-out forwards;
            opacity: 0;
          }

          .rain {
            position: absolute;
            width: 100%;
            height: 100%;
            background: linear-gradient(transparent, rgba(255, 255, 255, 0.1));
            animation: rain 0.5s linear infinite;
          }

          @keyframes rain {
            0% {
              background-position: 0% 0%;
            }
            100% {
              background-position: 20% 100%;
            }
          }

          .sunset-text {
            color: #ffd700;
            font-weight: bold;
          }

          @keyframes glimmer {
            0% {
              background-position: 0%;
            }
            100% {
              background-position: 200%;
            }
          }

          .sunset-border {
            border: 2px solid;
            border-image-source: linear-gradient(
              90deg,
              #ff4500,
              #ffa500,
              #ffd700
            );
            border-image-slice: 1;
            transition: all 0.3s ease;
          }

          /* Cool button hover effects */
          .menu-btn {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            transform-origin: center;
          }

          .menu-btn:hover {
            transform: scale(1.02) rotate(1deg);
            filter: brightness(1.2) contrast(1.1);
          }

          .menu-btn:hover .sunset-border {
            border: none;
            box-shadow: none;
          }

          .menu-btn:hover img {
            transform: scale(1.05);
            filter: brightness(1.2);
          }

          .menu-btn img {
            transition: all 0.3s ease;
          }

          .menu-btn:hover h2 {
            transform: translateY(-2px);
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
          }

          .menu-btn h2 {
            transition: all 0.3s ease;
          }
        `}</style>
      </div>
    </>
  );
};

export default MainPage;

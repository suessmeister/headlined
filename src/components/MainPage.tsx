'use client'
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWallet } from "@solana/wallet-adapter-react";
import { connectSocket, disconnectSocket, getSocket } from "../app/utils/socket";
import { WalletButton } from "@/components/solana/solana-provider";
import { supabase } from "../app/utils/supabaseClient";

const MainPage: React.FC = () => {
   const router = useRouter();
   const { publicKey } = useWallet();

   const [activeGun, setActiveGun] = useState<{ name: string } | null>(null);
   const [showIntroScroll, setShowIntroScroll] = useState(false);
   const [isMatchmakingOpen, setIsMatchmakingOpen] = useState(false);
   const [matchFound, setMatchFound] = useState(false);
   const [opponent, setOpponent] = useState<string | null>(null);
   const [countdown, setCountdown] = useState(5);
   const countdownRef = React.useRef<NodeJS.Timeout | null>(null);
   const [onlineUsers, setOnlineUsers] = useState<number>(0);
   const [consentGiven, setConsentGiven] = useState(false);

   useEffect(() => {
      if (publicKey) {
         // Check if user is on waitlist when wallet connects
         const checkWaitlist = async () => {
            const walletAddress = publicKey.toBase58();

            const { data, error: fetchError } = await supabase
               .from('waitlist')
               .select('address')
               .eq('address', walletAddress)
               .single();

            if (fetchError && fetchError.code !== 'PGRST116') {
               console.error('Error checking waitlist:', fetchError);
               return;
            }

            if (!data) {
               // Not on waitlist - add them
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
            }
         };

         checkWaitlist();
      }
   }, [publicKey]);

   useEffect(() => {
      const socket = getSocket();

      const handleUserCount = (count: number) => {
         console.log("👥 Current users online:", count);
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
      router.push('/lobby');
   };

   const handleJoinMatch = () => {
      const socket = getSocket();

      if (!publicKey) {
         console.error("No wallet connected!");
         return;
      }

      sessionStorage.removeItem("matchSeed");
      sessionStorage.removeItem("matchId");

      setIsMatchmakingOpen(true);

      socket.emit("join_matchmaking", { walletAddress: publicKey.toString() });

      socket.on("match_found", ({ roomId, seed, opponent }: {
         roomId: string;
         seed: string;
         opponent: string;
      }) => {
         console.log("🎯 Match found!", roomId, seed, opponent);

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
      });

      socket.on("waiting", ({ message }: { message: string }) => {
         console.log("⌛ Waiting:", message);
      });
   };

   useEffect(() => {
      const socket = getSocket();

      socket.on("user_count", (count) => {
         console.log("👥 Current users online:", count);
         // Optional: store in state for UI
      });

      return () => {
         socket.off("user_count");
      };
   }, []);

   return (
      <>
         {!publicKey && (
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

                  {publicKey && (
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
                     </div>
                  )}
               </div>
            </div>
         )}

         {showIntroScroll && (
            <div
               style={{
                  /* full‑screen dimmer */
                  position: "fixed",
                  inset: 0,
                  background: "rgba(0,0,0,0.6)",
                  zIndex: 100000,

                  /* flexbox centering */
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",

                  /* vertical scroll for very small screens */
                  overflowY: "auto",
                  /* edge gutter that scales with viewport */
                  padding: "4vw",

                  fontFamily: "'Courier New', monospace",
                  letterSpacing: "0.4px",
                  color: "white",
               }}
            >
               {/* bounded intro panel */}
               <div
                  style={{
                     width: "100%",
                     maxWidth: "800px",
                  }}
               >
                  <h1
                     style={{
                        fontSize: "clamp(28px, 3.2vw, 42px)",
                        marginBottom: "1.5rem",
                        textAlign: "center",
                        color: "#FFA500",
                        textShadow: "0 0 8px black",
                     }}
                  >
                     Welcome to <span style={{ color: "white" }}>Headlined</span>.
                  </h1>

                  <p
                     style={{
                        fontSize: "clamp(16px, 1.2vw, 20px)",
                        lineHeight: "1.8",
                        textShadow: "0 0 4px black",
                     }}
                  >
                     Your enemies are taking over.
                     <br />
                     <br />
                     Zoom, scan windows, and pick off the enemies before they fire back.&nbsp;
                     <span style={{ color: "#FFA500" }}>Only headshots count.</span>
                     <br />
                     You can shoot the balloons as well.
                     <br />
                     <br />
                     You only need&nbsp;<span style={{ color: "#FFA500" }}>Ctrl</span> to scope and&nbsp;
                     <span style={{ color: "#FFA500" }}>Click</span> to shoot.
                     <br />
                     <br />
                     The&nbsp;<span style={{ color: "#FFA500" }}>Arsenal</span> contains snipers for purchase
                     with various scopes and mags. Use the one that inspires you.
                     <br />
                     <br />
                     Join a&nbsp;<strong>Live Match</strong>&nbsp;to go 1‑v‑1 against another opponent.
                     <br />
                     <br />
                     You will be graded on&nbsp;<strong>hits</strong>. Rounds last&nbsp;
                     <span style={{ color: "#FFA500" }}>2&nbsp;minutes</span>. Both players receive the same
                     match + RNG. Compete on any platform of your choosing!
                     <br />
                     <br />
                     Will you make headlines and save the city?
                  </p>

                  <div
                     style={{
                        marginTop: "2rem",
                        display: "flex",
                        justifyContent: "flex-end",
                     }}
                  >
                     <button
                        onClick={() => setShowIntroScroll(false)}
                        style={{
                           padding: "0.8rem 1.6rem",
                           fontSize: "clamp(14px, 1.1vw, 18px)",
                           fontFamily: "monospace",
                           backgroundColor: "#FF4500",
                           color: "white",
                           border: "none",
                           borderRadius: "6px",
                           cursor: "pointer",
                           boxShadow: "0 0 10px #FF4500",
                        }}
                     >
                        Continue →
                     </button>
                  </div>
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

         <div className="min-h-screen bg-gray-900 relative overflow-hidden" style={{ cursor: 'none' }}>
            {/* Custom cursor */}
            <div
               className="custom-cursor"
               style={{
                  position: "fixed",
                  width: "32px",
                  height: "32px",
                  backgroundImage: "url('/city/better.png')",
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  pointerEvents: "none",
                  zIndex: 9999,
                  transform: "translate(-50%, -50%)",
                  transition: "transform 0.1s ease",
                  filter: "hue-rotate(120deg) brightness(1.5)",
               }}
            />

            <img
               src="/city/we_made_it.gif"
               style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100vw",
                  height: "100vh",
                  objectFit: "contain", // ensures no cropping
                  zIndex: 0,
               }}
               alt="Background"
            />

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
                     wallet: {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
                  </span>
               </div>
            )}

            {/* Rain effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-transparent">
               <div className="rain"></div>
            </div>

            <button
               onClick={() => setShowIntroScroll(true)}
               style={{
                  position: "fixed",
                  top: "-2%",                // moved up from 10%
                  left: "50%",
                  transform: "translateX(-360px)", // moved further left from -275px
                  zIndex: 1000,
                  fontSize: "32px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "8px",
                  transition: "transform 0.2s ease",
               }}
               onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateX(-360px) scale(1.2)";
               }}
               onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateX(-360px)";
               }}
            >
               📜
            </button>

            {/* Left Column */}
            <div className="absolute top-0 left-0 h-screen w-[27%] z-10 flex flex-col pointer-events-auto">
               <Link href="/arsenal" className="flex-1 group relative overflow-hidden cursor-none">
                  <div className="bg-gray-800/80 backdrop-blur-sm p-6 h-full w-full flex flex-col items-center justify-center sunset-border">
                     <h2 className="text-2xl font-bold sunset-text mb-2">Arsenal</h2>
                     {activeGun && (
                        <p className="text-base text-gray-300 text-center">Now Using: {activeGun.name}</p>
                     )}
                     <img
                        src="/city/button_arsenal.png"
                        className="absolute bottom-0 left-1/2 opacity-0
                                    group-hover:opacity-100
                                    group-hover:animate-[bounceUpCentered_0.7s_ease-out_forwards]"
                     />
                  </div>
               </Link>

               <Link href="/headlines" className="flex-1 group relative overflow-hidden cursor-none">
                  <div className="bg-gray-800/80 backdrop-blur-sm p-6 h-full w-full flex flex-col items-center justify-center sunset-border">
                     <h2 className="text-2xl font-bold sunset-text mb-2">Headlines</h2>
                     <img
                        src="/city/button_headlines.png"
                        className="absolute bottom-0 left-1/2 opacity-0
                 group-hover:opacity-100
                 group-hover:animate-[bounceUpCentered_0.7s_ease-out_forwards]"
                     />
                  </div>
               </Link>
            </div>

            {/* Right Column */}
            <div className="absolute top-0 right-0 h-screen w-[27%] z-10 flex flex-col pointer-events-auto">
               {/* Join Match */}
               <div onClick={handleJoinMatch} className="cursor-none flex-1 group relative overflow-hidden">
                  <div className="bg-gray-800/80 backdrop-blur-sm p-6 h-full w-full flex flex-col items-center justify-center sunset-border">
                     <h2 className="text-2xl font-bold sunset-text mb-2">Join Match</h2>
                     {isMatchmakingOpen ? (
                        <p className="text-gold text-base font-mono font-bold">Waiting for match...</p>
                     ) : (
                        <p className="text-base text-gray-300">Click to find a match</p>
                     )}
                     <img
                        src="/city/live_button.png"
                        className="absolute bottom-0 left-1/2 opacity-0
                   group-hover:opacity-100
                   group-hover:animate-[bounceUpCentered_0.7s_ease-out_forwards]"
                     />
                  </div>
               </div>

               {/* Practice Match */}
               <div onClick={handlePracticeClick} className="cursor-none flex-1 group relative overflow-hidden">
                  <div className="bg-gray-800/80 backdrop-blur-sm p-6 h-full w-full flex items-center justify-center sunset-border">
                     <h2 className="text-2xl font-bold sunset-text">Practice Match</h2>
                     <img
                        src="/city/lobby_button.png"
                        className="absolute bottom-0 left-1/2 opacity-0
                   group-hover:opacity-100
                   group-hover:animate-[bounceUpCentered_0.7s_ease-out_forwards]"
                     />
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
  0%   { transform: translate(-50%, 100%);   opacity: 0; }
  60%  { transform: translate(-50%, -20%);  opacity: 1; }
  80%  { transform: translate(-50%,  10%); }
  100% { transform: translate(-50%,   0%); }
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

   .custom-cursor {
     position: fixed;
     pointer-events: none;
     z-index: 9999;
   }

   /* Glimmering sunset gradient text */
.sunset-text {
  color: #FFD700;
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

   /* Sunset gradient for button borders */
   .sunset-border {
     border: 2px solid;
     border-image-source: linear-gradient(90deg, #FF4500, #FFA500, #FFD700);
     border-image-slice: 1;
   }
`}</style>

            <script dangerouslySetInnerHTML={{
               __html: `
              document.addEventListener('mousemove', (e) => {
                const cursor = document.querySelector('.custom-cursor');
                if (cursor) {
                  cursor.style.left = e.clientX + 'px';
                  cursor.style.top = e.clientY + 'px';
                }
              });
            `
            }} />
         </div>
      </>
   );
};

export default MainPage;


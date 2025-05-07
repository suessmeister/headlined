'use client'
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWallet } from "@solana/wallet-adapter-react";
import { getSocket } from "../app/utils/socket";

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

   useEffect(() => {
      const savedGun = localStorage.getItem("selectedGun");
      if (savedGun) {
         setActiveGun(JSON.parse(savedGun));
      } else {
         // Set default gun if none is selected
         const defaultGun = { name: "Default Sniper" };
         localStorage.setItem("selectedGun", JSON.stringify(defaultGun));
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

      localStorage.removeItem("matchSeed");
      localStorage.removeItem("matchId");

      setIsMatchmakingOpen(true);

      socket.emit("join_matchmaking", { walletAddress: publicKey.toString() });

      socket.on("match_found", ({ roomId, seed, opponent }: {
         roomId: string;
         seed: string;
         opponent: string;
      }) => {
         console.log("🎯 Match found!", roomId, seed, opponent);

         // Store match data
         localStorage.setItem("matchSeed", seed);
         localStorage.setItem("matchId", roomId);

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

   return (
      <>
         {showIntroScroll && (
            <div
               style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100vw",
                  height: "100vh",
                  background: "rgba(0, 0, 0, 0.6)",
                  color: "white",
                  overflowY: "scroll",
                  zIndex: 100000,
                  padding: "40px",
                  fontFamily: "'Courier New', monospace",
                  letterSpacing: "0.4px",
               }}
            >
               <div style={{ minHeight: "250vh", maxWidth: "800px", margin: "0 auto" }}>
                  <h1
                     style={{
                        fontSize: "42px",
                        marginBottom: "28px",
                        textAlign: "center",
                        color: "#FFA500",
                        textShadow: "0 0 8px black",
                     }}
                  >
                     Welcome to <span style={{ color: "white" }}>Headlined</span>.
                  </h1>

                  <p
                     style={{
                        fontSize: "20px",
                        lineHeight: "1.8",
                        textShadow: "0 0 4px black",
                     }}
                  >
                     Your enemies are taking over.
                     <br />
                     <br />
                     Zoom, scan windows, and pick off the enemies before they fire back.{" "}
                     <span style={{ color: "#FFA500" }}>Only headshots count.</span>
                     <br />
                     You can shoot the balloons as well.
                     <br />
                     <br />
                     You only need <span style={{ color: "#FFA500" }}>Ctrl</span> to scope and{" "}
                     <span style={{ color: "#FFA500" }}>Click</span> to shoot.
                     <br />
                     <br />
                     The <span style={{ color: "#FFA500" }}>Arsenal</span> contains snipers for purchase with various scopes and mags.
                     <br />
                     Use the one that inspires you.
                     <br />
                     <br />
                     Join a <strong>Live Match</strong> to go 1v1 against another opponent.
                     <br />
                     <br />
                     You will be graded on <strong>hits</strong>. Rounds last <span style={{ color: "#FFA500" }}>2 minutes</span>.
                     <br />
                     Both players will receive the same match + rng. Compete on any platform of your choosing!
                     <br />
                     <br />
                     Will you make headlines and save the city?
                  </p>

                  <div
                     style={{
                        marginTop: "30px",
                        display: "flex",
                        justifyContent: "flex-end",
                     }}
                  >
                     <button
                        onClick={() => setShowIntroScroll(false)}
                        style={{
                           padding: "12px 26px",
                           fontSize: "18px",
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
                  backgroundImage: "url('/city/default_scope.png')",
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  pointerEvents: "none",
                  zIndex: 9999,
                  transform: "translate(-50%, -50%)",
                  transition: "transform 0.1s ease",
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



            {/* L:eft Column */}
            <div className="absolute top-0 left-0 h-screen w-[27%] z-10 flex flex-col pointer-events-auto">
               <Link href="/arsenal" className="flex-1 group relative overflow-hidden cursor-none">
                  <div className="bg-gray-800/80 backdrop-blur-sm p-6 h-full w-full flex flex-col items-center justify-center border border-white transition-all hover:scale-[1.01] animate-fadeIn" style={{ animationDelay: '2.2s' }}>
                     <h2 className="text-2xl font-bold text-white mb-2">Arsenal</h2>
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
                  <div className="bg-gray-800/80 backdrop-blur-sm p-6 h-full w-full flex flex-col items-center justify-center border border-white transition-all hover:scale-[1.01] animate-fadeIn" style={{ animationDelay: '3.0s' }}>
                     <h2 className="text-2xl font-bold text-white">Headlines</h2>

                     <img
                        src="/city/button_headlines.png"
                        className="absolute bottom-0 left-1/2 opacity-0
                 group-hover:opacity-100
                 group-hover:animate-[bounceUpCentered_0.7s_ease-out_forwards]"
                     />
                  </div>
               </Link>

            </div>

            {/* RIGHT column */}
            <div className="absolute top-0 right-0 h-screen w-[27%] z-10 flex flex-col pointer-events-auto">
               {/* Join Match */}
               <div onClick={handleJoinMatch} className="cursor-pointer flex-1 group relative overflow-hidden cursor-none">
                  <div className="bg-gray-800/80 backdrop-blur-sm p-6 h-full w-full flex flex-col items-center justify-center border border-white transition-all hover:scale-[1.01] animate-fadeIn" style={{ animationDelay: '2.6s' }}>
                     <h2 className="text-2xl font-bold text-white mb-2">Join Match</h2>
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
               <div onClick={handlePracticeClick} className="cursor-pointer flex-1 group relative overflow-hidden cursor-none">
                  <div className="bg-gray-800/80 backdrop-blur-sm p-6 h-full w-full flex items-center justify-center border border-white transition-all hover:scale-[1.01] animate-fadeIn" style={{ animationDelay: '3.4s' }}>
                     <h2 className="text-2xl font-bold text-white">Practice Match</h2>
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


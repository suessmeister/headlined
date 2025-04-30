import { useWallet } from "@solana/wallet-adapter-react";
import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import * as THREE from "three";
import { useSniperHandlers } from "./handlers/sniper_handler";
import { useZoomHandlers } from "./handlers/zoom_handler";
import { generateCity } from "./drawing/city_render";
import { io } from "socket.io-client";
import { getSocket } from "../app/utils/socket";
import { useRouter } from "next/navigation";
import FlippingTimer from "./handlers/timer_handler";


import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useCallback } from "react";
import { FlyingBalloon } from "./drawing/flying_balloon";




const gun_metadata = {
   "AW Magnum": {
      scope: "2.2",
      capacity: "5",
      reload: "3.2"
   },
   "Barrett M82": {
      scope: "2.0",
      capacity: "10",
      reload: "3.5"
   },
   "Blaser R93": {
      scope: "2.5",
      capacity: "5",
      reload: "2.8"
   },
   "M40A5": {
      scope: "1.5",
      capacity: "5",
      reload: "2.5"
   },
   "Sako TRG 42": {
      scope: "2.0",
      capacity: "7",
      reload: "2.6"
   },
   "SSG 69": {
      scope: "1.6",
      capacity: "10",
      reload: "2.2"
   },
   "SSG 3000": {
      scope: "1.7",
      capacity: "6",
      reload: "2.4"
   }

};



export interface Character {
   id: number;
   x: number;
   y: number;
   image: string;
}

// Sniper scope logo styled component
const SniperScope = styled.img<{ x: number; y: number; visible: boolean }>`
  position: absolute;
  left: ${(props) => props.x - 25}px; /* Center the logo */
  top: ${(props) => props.y - 25}px; /* Center the logo */
  width: 50px;
  height: 50px;
  opacity: ${(props) => (props.visible ? 1 : 0)};
  transition: opacity 1s ease-in-out;
  pointer-events: none;
  z-index: 999;
  visibility: ${(props) => (props.visible ? "visible" : "hidden")};
`;

const CharacterImg = styled.img<{ x: number; y: number }>`
  position: absolute;
  left: ${(props) => props.x - 2}px;
  top: ${(props) => props.y - 1}px;
  width: 18px;
  height: auto;
  pointer-events: none;
`;


const Lobby: React.FC = () => {
   const [isZoomed, setIsZoomed] = useState(false);
   const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
   const [isZoomedOut, setIsZoomedOut] = useState(false);
   const [sniperScopePosition, setSniperScopePosition] = useState<{
      x: number;
      y: number;
   } | null>(null);
   const [isSniperScopeVisible, setIsSniperScopeVisible] = useState(false);
   const [shots, setShots] = useState(0);
   const [hits, setHits] = useState(0);
   const [isLastShotHit, setIsLastShotHit] = useState(false);
   const [timeLeft, setTimeLeft] = useState(120);
   const [activeGun, setActiveGun] = useState<any | null>(null);
   const [isMatchmakingOpen, setIsMatchmakingOpen] = useState(false);

   const CHARACTER_PROBABILITY = 0.1;
   const [characters, setCharacters] = useState<Character[]>([]);

   const canvasRef = useRef<HTMLCanvasElement>(null);
   const mountRef = useRef<HTMLDivElement>(null);
   const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
   const sceneRef = useRef<THREE.Scene | null>(null);
   const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
   const characterRef = useRef<Character[]>([]);
   const balloonRef = useRef<{ id: number; x: number; y: number; size: number, isHit: boolean }[]>([]);


   const [flashMessage, setFlashMessage] = useState<string | null>(null);
   const [shouldRedirect, setShouldRedirect] = useState(false);

   const initGun = useRef(false);

   const { publicKey, disconnect, sendTransaction, wallet } = useWallet();
   const [flash, setFlash] = useState<"hit" | "miss" | null>(null);




   const [ammo, setAmmo] = useState<number>(0);
   const [maxAmmo, setMaxAmmo] = useState<number>(0);
   const [isReloading, setIsReloading] = useState(false);
   const [showReloading, setShowReloading] = useState(false);


   const [reloadSecondsLeft, setReloadSecondsLeft] = useState<number | null>(null);

   const router = useRouter();

   // give handle click fresh values
   const isZoomedRef = useRef(false);
   const zoomPosRef = useRef({ x: 0, y: 0 });
   const reloadStartTimeRef = useRef<number>(0);

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

      socket.on("start", ({ roomId, seed }: { roomId: string, seed: string }) => {
         console.log("🎯 Match found!", roomId, seed);
         localStorage.setItem("matchSeed", seed);
         localStorage.setItem("matchId", roomId);
         router.push(`/city/${roomId}`);
      });

      socket.on("waiting", ({ message }: { message: string }) => {
         console.log("⌛ Waiting:", message);
      });

      socket.on("already_in_match", () => {
         console.log("🚫 Already in match!");
         setIsMatchmakingOpen(false); // optional: let them try again later
         alert("You are already in a match! Finish it first.");
      });
   };

   const [balloons, setBalloons] = useState<
      { id: number; startY: number; duration: number; size: number }[]
   >([]);

   /* helper to purge after animation */
   const removeBalloon = useCallback((id: number) => {
      setBalloons((prev) => prev.filter((b) => b.id !== id));
   }, []);

   useEffect(() => {
      const spawn = () => {
         const id = Date.now();
         const startY = Math.random() * window.innerHeight * 0.1 + 50;
         const duration = 15 + Math.random() * 5;
         const size = 80 + Math.random() * 25;

         setBalloons((prev) => [...prev, { id, startY, duration, size }]);

         // 💥 Add to the tracking ref
         balloonRef.current.push({
            id,
            x: window.innerWidth + 150, // start off-screen right
            y: startY,
            size,
            isHit: false,
         });

         // 🔁 Schedule next spawn
         const nextDelay = 8000 + Math.random() * 8000;
         setTimeout(spawn, nextDelay);
      };

      spawn();
   }, []);



   useSniperHandlers({
      sceneRef,
      cameraRef,
      setShots,
      setHits,
      setIsLastShotHit,
      setSniperScopePosition,
      setIsSniperScopeVisible,
      characterRef,
      isZoomedRef,
      zoomPosRef,
      setAmmo,
      ammo,
      isReloading,
      balloonRef
   });

   useZoomHandlers({
      setIsZoomed,
      setZoomPosition,
   });


   useEffect(() => {
      const savedGun = localStorage.getItem("selectedGun");
      if (savedGun) {
         const parsedGun: { name: keyof typeof gun_metadata } = JSON.parse(savedGun);
         setActiveGun(parsedGun);
         const capacity = Number(gun_metadata[parsedGun.name].capacity);
         setAmmo(capacity);
         setMaxAmmo(capacity);
         setIsReloading(false);
      }
      initGun.current = true;
   }, []);

   useEffect(() => {
      if (!initGun.current || ammo === null || isReloading || ammo > 0) return;

      const reloadDuration = activeGun
         ? parseFloat(gun_metadata[activeGun.name as keyof typeof gun_metadata].reload)
         : 5;

      setIsReloading(true);
      setIsZoomed(false);
      setShowReloading(true);
      document.body.style.cursor = "default";
      setReloadSecondsLeft(reloadDuration);

      const start = performance.now();
      const updateTimer = (now: number) => {
         const elapsed = (now - start) / 1000;
         const remaining = Math.max(reloadDuration - elapsed, 0);
         setReloadSecondsLeft(remaining);

         if (remaining > 0) {
            requestAnimationFrame(updateTimer);
         } else {
            setAmmo(maxAmmo);
            setIsReloading(false);
            setShowReloading(false);
            setReloadSecondsLeft(null);
         }
      };

      requestAnimationFrame(updateTimer);
   }, [ammo, isReloading, maxAmmo, activeGun]);




   useEffect(() => {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
         75,
         window.innerWidth / window.innerHeight,
         0.1,
         1000,
      );
      camera.position.z = 5;

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);

      renderer.setClearColor(0x000000, 0);
      renderer.domElement.style.background = "transparent";
      renderer.domElement.style.pointerEvents = "none";
      renderer.domElement.style.zIndex = "0";

      mountRef.current?.appendChild(renderer.domElement);

      sceneRef.current = scene;
      cameraRef.current = camera;
      rendererRef.current = renderer;

      // 🔥 After renderer setup, now safely generate city!
      if (canvasRef.current) {
         const seed = `practice-${Date.now()}`;
         generateCity(canvasRef.current, setCharacters, seed);
      }

      const renderLoop = () => {
         renderer.render(scene, camera);
         requestAnimationFrame(renderLoop);
      };
      renderLoop();

      const originalZoom = window.devicePixelRatio;
      const zoomCheckInterval = setInterval(() => {
         const currentZoom = window.devicePixelRatio;
         setIsZoomedOut(Math.abs(currentZoom - originalZoom) > 0.1);
      }, 100);

      return () => {
         clearInterval(zoomCheckInterval);
         renderer.dispose();
         mountRef.current?.removeChild(renderer.domElement);
         document.body.style.cursor = "default";
      };
   }, []);

   useEffect(() => {
      setFlash(isLastShotHit ? "hit" : "miss");
      const timer = setTimeout(() => setFlash(null), 500);
      return () => clearTimeout(timer);
   }, [shots, isLastShotHit]);

   const wrapperStyle: React.CSSProperties = {
      transform: isZoomed ? "scale(5)" : "scale(1)",
      transformOrigin: `${zoomPosition.x}px ${zoomPosition.y}px`,
      transition: "transform 0.2s ease",
      width: "100vw",
      height: "100vh",
      position: "relative",
      overflow: "hidden",
      cursor: isZoomed ? "none" : "default",
   };

   useEffect(() => {
      // whenever isZoomed changes
      isZoomedRef.current = isZoomed;
   }, [isZoomed]);

   useEffect(() => {
      // whenever zoomPos changes
      zoomPosRef.current = zoomPosition;
   }, [zoomPosition]);

   useEffect(() => {
      characterRef.current = characters;
   }, [characters]);



   useEffect(() => {
      const savedGun = localStorage.getItem("selectedGun");
      if (savedGun) {
         const parsedGun: { name: keyof typeof gun_metadata } = JSON.parse(savedGun);
         setActiveGun(parsedGun);
         setAmmo(Number(gun_metadata[parsedGun.name].capacity));
         setMaxAmmo(Number(gun_metadata[parsedGun.name].capacity));
         setIsReloading(false);
      }
      // ❗ else do NOTHING
   }, []);


   


   return (
      <>
         {flashMessage && (
            <div style={{
               position: "fixed",
               top: 0,
               width: "100%",
               textAlign: "center",
               padding: "10px",
               backgroundColor: "rgba(255, 0, 0, 0.8)",
               color: "white",
               fontSize: "18px",
               fontFamily: "monospace",
               zIndex: 9999,
               animation: "fadeInOut 2s ease-in-out",
            }}>
               {flashMessage}
            </div>
         )}

         <div style={{
            position: "fixed",
            top: 60,
            right: 20,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            padding: "5px 15px",
            borderRadius: "8px",
            color: "white",
            fontFamily: "monospace",
            fontSize: "16px",
            zIndex: 9999,
            display: "flex",
            gap: "20px",
         }}>
            {activeGun && <div>Now Using: {activeGun.name}</div>}
         </div>




         <div style={{
            position: "fixed",
            top: 20,
            left: 20,
            zIndex: 9999,
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            padding: "8px 14px",
            borderRadius: "6px",
         }}>
            <div style={{
               display: "flex",
               flexDirection: "column",
               gap: "10px",
            }}>
               <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  fontFamily: "monospace",
                  fontSize: "16px",
                  color: "white",
                  textShadow: "0 0 3px black",
               }}>
                  <div>
                     Shots: <span style={{ color: "black" }}>{shots}</span> | Hits: <span style={{ color: flash === "hit" ? "lightgreen" : "black" }}>{hits}</span> | Accuracy: <span style={{ color: flash === "hit" ? "lightgreen" : "black" }}>
                        {shots > 0 ? ((hits / shots) * 100).toFixed(1) + "%" : "0%"}
                     </span>
                  </div>
               </div>

               {!isMatchmakingOpen ? (
                  <button
                     onClick={handleJoinMatch}
                     style={{
                        backgroundColor: "rgba(80, 0, 0, 0.9)",
                        color: "white",
                        border: "1px solid rgba(255, 255, 255, 0.3)",
                        padding: "8px 16px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontFamily: "monospace",
                        fontSize: "14px",
                        transition: "all 0.2s ease",
                     }}
                  >
                     Matchmaking
                  </button>
               ) : (
                  <div
                     style={{
                        color: "gold",
                        fontSize: "18px",
                        fontFamily: "monospace",
                        fontWeight: "bold",
                        textShadow: "0 0 5px black",
                     }}
                  >
                     Waiting for match...
                  </div>
               )}
   
              
               </div>
            </div>
        
         <div style={wrapperStyle}>
            <div ref={mountRef} style={{
               position: "absolute",
               top: 0,
               left: 0,
               width: "100%",
               height: "100%",
               zIndex: 10,
            }} />

            {publicKey && (
               <div style={{
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
               }}>
                  Wallet: {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
               </div>
            )}

            <>
               {balloons.map((b) => (
                  <FlyingBalloon
                     key={b.id}
                     {...b}
                     onFinish={removeBalloon}
                     balloonRef={balloonRef}
                  />
               ))}
            </>


            <canvas ref={canvasRef} style={{
               position: "absolute",
               top: 0,
               left: 0,
               width: "100%",
               height: "100%",
               zIndex: 0,
               cursor: isZoomed ? "none" : "default",
            }} />

            {!isZoomedOut && characters.map((c) => (
               <CharacterImg
                  key={c.id}
                  x={c.x}
                  y={c.y}
                  src={c.image}
                  alt="Character"
                  style={{ zIndex: 2 }}
               />
            ))}

            {sniperScopePosition && (
               <SniperScope
                  src="city/default_scope.png"
                  x={sniperScopePosition.x}
                  y={sniperScopePosition.y}
                  visible={isSniperScopeVisible}
                  style={{
                     filter: isLastShotHit
                        ? "hue-rotate(0deg) brightness(1.5) saturate(2)"
                        : "none",
                  }}
               />
            )}

            {isZoomed && (
               <div style={{
                  position: "fixed",
                  top: zoomPosition.y - 36,
                  left: zoomPosition.x - 55,
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  border: `2px solid ${isLastShotHit ? "red" : "gray"}`,
                  boxShadow: isLastShotHit ? "0 0 20px red" : "0 0 20px gray",
                  pointerEvents: "none",
                  zIndex: 999,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  cursor: "none",
               }}>
                  <div style={{
                     position: "absolute",
                     width: "0.2px",
                     height: "100%",
                     backgroundColor: isLastShotHit ? "red" : "gray",
                  }} />
                  <div style={{
                     position: "absolute",
                     width: "100%",
                     height: "0.2px",
                     backgroundColor: isLastShotHit ? "red" : "gray",
                  }} />
               </div>
            )}

            {/* 🔥 NEW: Reload Timer showing ONLY in one place */}
            {isReloading && reloadSecondsLeft !== null && (
               <>
                  {isZoomed ? (
                     <div style={{
                        position: "fixed",
                        top: `${zoomPosition.y}px`,
                        left: `${zoomPosition.x}px`,
                        transform: "translate(-50%, -50%)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                        padding: "12px 20px",
                        borderRadius: "12px",
                        zIndex: 1000,
                        pointerEvents: "none",
                     }}>
                        <div style={{
                           color: "gold",
                           fontSize: "28px",
                           fontFamily: "monospace",
                           marginBottom: "8px",
                           textShadow: "0 0 6px black",
                        }}>
                           Reloading...
                        </div>
                        <div style={{
                           color: "gold",
                           fontSize: "36px",
                           fontFamily: "monospace",
                           textShadow: "0 0 8px black",
                        }}>
                           {reloadSecondsLeft.toFixed(1)}
                        </div>
                     </div>
                  ) : (
                     <div style={{
                        position: "fixed",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                        padding: "16px 24px",
                        borderRadius: "14px",
                        zIndex: 1000,
                        pointerEvents: "none",
                     }}>
                        <div style={{
                           color: "gold",
                           fontSize: "32px",
                           fontFamily: "monospace",
                           marginBottom: "8px",
                           textShadow: "0 0 6px black",
                        }}>
                           Reloading...
                        </div>
                        <div style={{
                           color: "gold",
                           fontSize: "42px",
                           fontFamily: "monospace",
                           textShadow: "0 0 8px black",
                        }}>
                           {reloadSecondsLeft.toFixed(1)}
                        </div>
                     </div>
                  )}
               </>
            )}

            {/* Ammo Bar (vertical bullets) */}
            {!isReloading && isZoomed && (
               <div style={{
                  position: "fixed",
                  top: zoomPosition.y,
                  left: zoomPosition.x + 30,
                  transform: "translate(-50%, -50%)",
                  backgroundColor: "rgba(0, 0, 0, 0.4)",
                  padding: "2px",
                  borderRadius: "2px",
                  color: "white",
                  fontFamily: "monospace",
                  textShadow: "0 0 4px black",
                  zIndex: 1000,
                  pointerEvents: "none",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "50px",
                  width: "15px",
               }}>
                  {Array.from({ length: maxAmmo }).map((_, index) => (
                     <div
                        key={index}
                        style={{
                           flex: 1,
                           width: "70%",
                           backgroundColor: index < ammo ? "white" : "rgba(255, 255, 255, 0.2)",
                           borderRadius: "1px",
                           margin: "1px 0",
                           transition: "background-color 0.3s",
                        }}
                     />
                  ))}
               </div>
            )}
         </div>
      </>
   );

};

export default Lobby;





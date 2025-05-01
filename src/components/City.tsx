
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

interface CityProps {
  matchId: string;
}


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
  isSniper?: boolean;
  phase?: "warmup" | "dark" | "aggressive";
  nextPhase?: number;
  laserCooldown?: number;
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

const City: React.FC<CityProps> = ({ matchId }) => {
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
  const [isGameOver, setIsGameOver] = useState(false);
  const [activeGun, setActiveGun] = useState<any | null>(null);

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
  // const [waiting, setWaiting] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);


  const { publicKey, disconnect, sendTransaction, wallet } = useWallet();
  const [matchSeed, setMatchSeed] = useState<string | null>(null);
  const [flash, setFlash] = useState<"hit" | "miss" | null>(null);

  // Tracking Enemy States! 
  const [enemyHits, setEnemyHits] = useState(0);


  const [ammo, setAmmo] = useState<number>(0);
  const [maxAmmo, setMaxAmmo] = useState<number>(0);
  const [isReloading, setIsReloading] = useState(false);
  const [showReloading, setShowReloading] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const [reloadSecondsLeft, setReloadSecondsLeft] = useState<number | null>(null);

  const router = useRouter();

  // give handle click fresh values
  const isZoomedRef = useRef(false);
  const zoomPosRef = useRef({ x: 0, y: 0 });
  const reloadStartTimeRef = useRef<number>(0);




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
    if (gameStarted && ammo !== null && ammo <= 0 && !isReloading) {
      const reloadDuration = activeGun
        ? parseFloat(gun_metadata[activeGun.name as keyof typeof gun_metadata].reload)
        : 10; // fallback if no activeGun

      setIsReloading(true);
      setIsZoomed(false);
      setShowReloading(true);
      document.body.style.cursor = "default";
      setReloadSecondsLeft(reloadDuration);
      // console.log("Reloading...");

      const start = performance.now();

      const updateTimer = (now: number) => {
        const elapsed = (now - start) / 1000; // ms -> s
        const remaining = Math.max(reloadDuration - elapsed, 0);
        setReloadSecondsLeft(remaining);

        if (remaining > 0) {
          requestAnimationFrame(updateTimer);
        } else {
          setAmmo(maxAmmo);
          setIsReloading(false);
          setShowReloading(false);
          setReloadSecondsLeft(null);
          // console.log("Reloaded!");
        }
      };

      requestAnimationFrame(updateTimer);
    }
  }, [ammo, isReloading, maxAmmo, gameStarted, activeGun]);



  useEffect(() => {
    const socket = getSocket();

    if (!socket.connected) socket.connect();

    const seed = localStorage.getItem("matchSeed");
    const matchId = localStorage.getItem("matchId");

    if (seed && matchId && !gameStarted) {
      console.log("🎮 Resuming match with cached data:", matchId, seed);
      setMatchSeed(seed);
      setGameStarted(true);

      if (canvasRef.current) {
        generateCity(canvasRef.current, setCharacters, seed);
      }
    }

    socket.on("start", ({ roomId, seed }: { roomId: string, seed: string }) => {
      console.log("🎮 Match started (from socket):", seed);
      setMatchSeed(seed);
      setGameStarted(true);

      if (canvasRef.current) {
        generateCity(canvasRef.current, setCharacters, seed);
      }
    });

    socket.on("timer", ({ timeLeft }: { timeLeft: number }) => {
      setTimeLeft(timeLeft);
      if (timeLeft <= 0) {
        setIsGameOver(true);
        socket.disconnect();
        setTimeout(() => router.push("/game_over"), 1500);
      }
    });

    socket.on("shot", ({ characterId, by }: { characterId: number; by: string }) => {
      console.log("💥 Kill received:", characterId, "by", by);
      setCharacters((prev) => prev.filter((c) => c.id !== characterId));
      setFlashMessage(`Player ${by.slice(0, 4)}... hit an enemy!`);
      setTimeout(() => setFlashMessage(null), 2000);

      if (by === socket.id) {
        setHits((h) => h + 1);
      } else {
        setEnemyHits((h) => h + 1);
      }
    });

    return () => {
      socket.off("start");
      socket.off("timer");
      socket.off("shot");
    };
  }, []);

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
      const duration = 12 + Math.random() * 5;
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


  // ⬅ include router so ESLint is happy




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

    renderer.setClearColor(0x000000, 0); // RGB = black, alpha = 0  (fully transparent)
    renderer.domElement.style.background = "transparent";
    renderer.domElement.style.pointerEvents = "none"; // so clicks reach your own listeners
    renderer.domElement.style.zIndex = "0"; // keep it behind the 2‑D skyline

    mountRef.current?.appendChild(renderer.domElement);

    /* store in refs */
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    //
    const renderLoop = () => {
      renderer.render(scene, camera);
      requestAnimationFrame(renderLoop);
    };
    renderLoop();

    const originalZoom = window.devicePixelRatio;

    const checkZoom = () => {
      const currentZoom = window.devicePixelRatio;
      // Hide characters if zoom is not exactly at 100%
      setIsZoomedOut(Math.abs(currentZoom - originalZoom) > 0.1);
    };

    // Check zoom periodically
    const zoomCheckInterval = setInterval(checkZoom, 100);

    const reloadTimeSec = activeGun
      ? parseFloat(gun_metadata[activeGun.name as keyof typeof gun_metadata].reload)
      : 3;

    return () => {
      clearInterval(zoomCheckInterval);
      if (rendererRef.current) {
        rendererRef.current.dispose();
        mountRef.current?.removeChild(renderer.domElement);
      }

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
    marginTop: "-30px",
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

    } else { // using the default sniper rifle
      setAmmo(4);
      setMaxAmmo(4);
    }
  }, []);

  useEffect(() => {
    if (gameStarted && ammo !== null && ammo <= 0 && !isReloading) {
      setIsReloading(true);
      // console.log("Reloading...");
      setIsZoomed(false);
      setShowReloading(true);
      document.body.style.cursor = "default";
      setTimeout(() => {
        setAmmo(maxAmmo);
        setIsReloading(false);
        setShowReloading(false);
        // console.log("Reloaded!");
      }, 3000); // 3 seconds reload time
    }
  }, [ammo, isReloading, maxAmmo, gameStarted]);


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

          <span>
            <FlippingTimer remainingTime={timeLeft} />
          </span>
        </div>

        <div style={{
          marginTop: "6px",
          fontFamily: "monospace",
          fontSize: "14px",
          color: "white",
          textShadow: "0 0 2px black",
        }}>
          Enemy Hits: <span style={{ color: "red" }}>{enemyHits}</span>
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

        <canvas ref={canvasRef} style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
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

        {sniperScopePosition && (
          <SniperScope
            src="default_scope.png"
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

export default City;





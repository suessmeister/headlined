'use client'
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

import "react-circular-progressbar/dist/styles.css";
import { useCallback } from "react";
import { FlyingBalloon } from "./drawing/flying_balloon";
import { Character } from "./types/Character";
import { addSnipers } from "./handlers/add_snipers";
import EnemySnipers from "./drawing/enemy_snipers";
import seedrandom from "seedrandom"

const MAX_WAVES = 2; // maximum number of waves
const DARK_STAGGER_MS_FIRST = 400;
const DARK_STAGGER_MS_DEFAULT = 3000;

let nextDarkOrder = 0; // global variable to track the order of dark phases

interface CityProps {
  matchId: string;
}

const gun_metadata = {
  "Default Sniper": {
    scope: "1.5",
    capacity: "3",
    reload: "1.5",
  },
  "AW Magnum": {
    scope: "2.2",
    capacity: "5",
    reload: "3.2",
  },
  "Barrett M82": {
    scope: "2.0",
    capacity: "10",
    reload: "3.5",
  },
  "Blaser R93": {
    scope: "2.5",
    capacity: "5",
    reload: "2.8",
  },
  M40A5: {
    scope: "1.5",
    capacity: "5",
    reload: "2.5",
  },
  "Sako TRG 42": {
    scope: "2.0",
    capacity: "7",
    reload: "2.6",
  },
  "SSG 69": {
    scope: "1.6",
    capacity: "10",
    reload: "2.2",
  },
  "SSG 3000": {
    scope: "1.7",
    capacity: "6",
    reload: "2.4",
  },
};


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
  const balloonRef = useRef<
    { id: number; x: number; y: number; size: number; isHit: boolean }[]
  >([]);

  const [flashMessage, setFlashMessage] = useState<string | null>(null);
  const [flash, setFlash] = useState<"hit" | "miss" | null>(null);

  // Tracking Enemy States!
  const [enemyHits, setEnemyHits] = useState(0);

  const [ammo, setAmmo] = useState<number>(0);
  const [maxAmmo, setMaxAmmo] = useState<number>(0);
  const [isReloading, setIsReloading] = useState(false);
  const [showReloading, setShowReloading] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);


  const [reloadSecondsLeft, setReloadSecondsLeft] = useState<number | null>(
    null,
  );

  const [isPlayerHit, setIsPlayerHit] = useState(false);
  const [introMessage, setIntroMessage] = useState(false);
  const router = useRouter();

  // give handle click fresh values
  const isZoomedRef = useRef(false);
  const zoomPosRef = useRef({ x: 0, y: 0 });
  const reloadStartTimeRef = useRef<number>(0);
  const matchStartTimeRef = useRef<number | null>(null);

  const [waveMsgVisible, setWaveMsgVisible] = useState(false);
  const waveLockRef = useRef(false);        // prevents double‑trigger
  const [wave, setWave] = useState(1);      // optional: track wave #
  const [snipersVisible, setSnipersVisible] = useState(false);

  const rngRef = useRef<seedrandom.PRNG>(seedrandom(matchId));


  // add near your other useState declarations
  type MatchResult = { wallet: string; shotsFired: number };

  const [matchResults, setMatchResults] = useState<MatchResult[] | null>(null);



  useEffect(() => {
    const spawn = () => {
      const random = rngRef.current();
      const id = Date.now() + random;
      const startY = rngRef.current() * window.innerHeight * 0.1 + 50;
      const duration = 15 + rngRef.current() * 5;
      const size = 80 + rngRef.current() * 25;

      setBalloons((prev) => [...prev, { id, startY, duration, size }]);

      //  Add to the tracking ref
      balloonRef.current.push({
        id,
        x: window.innerWidth + 150, // start off-screen right
        y: startY,
        size,
        isHit: false,
      });

      // Schedule next spawn
      const nextDelay = 8000 + rngRef.current() * 8000;
      setTimeout(spawn, nextDelay);
    };

    spawn();
  }, []);

  useEffect(() => {
    console.log("TICKED ");
    let raf: number;

    const tick = () => {
      const now = Date.now();

      setCharacters((prev) =>
        prev.map((c) => {
          if (!c.isSniper) return c;
          if (!c.phase) return c; // always need a phase
          if (c.phase !== "aggressive" && !c.nextPhase) return c;

          // phase changes
          if (c.nextPhase && now >= c.nextPhase) {
            if (c.phase === "warmup") {
              // 1) 0.5 s between snipers
              const exitDelay = nextDarkOrder * 1700;          // 0‑ms, 500‑ms, 1000‑ms…
              nextDarkOrder++;                                  // increment *once* per sniper

              return {
                ...c,
                phase: "dark",
                image: "",
                nextPhase: now + exitDelay,                    
              };
            }



            if (c.phase === "dark") {
              return {
                ...c,
                phase: "aggressive",
                image: "/figures/evil_sniper_2.png",
                laserCooldown: now + 700 + rngRef.current() * 800,
                nextPhase: undefined,
              };
            }
          }

          // laser fire every cooldown
          if (c.phase === "aggressive" && !c.isHit && now >= (c.laserCooldown ?? 0)) {
            const nextCooldown = now + 2000 + rngRef.current() * 1200;

            c.laserCooldown = nextCooldown;

            fireLaser(c);
            return { ...c };
          }

          return c;
        }),
      );

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // laser
  const fireLaser = (c: Character) => {
    if (!sceneRef.current || !cameraRef.current) return;

    const cam = cameraRef.current;
    const scene = sceneRef.current;

    // Apply small offset before mapping to NDC (e.g., 10px right, 20px down)
    const visualOffsetX = 8;
    const visualOffsetY = 10;

    const logicalWidth = 1920;
    const logicalHeight = 1080;

    const ndc = new THREE.Vector2(
      ((c.x + visualOffsetX) / logicalWidth) * 2 - 1,
      -((c.y + visualOffsetY) / logicalHeight) * 2 + 1
    );

    // Ray from screen position
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(ndc, cam);
    const ray = raycaster.ray;

    // Origin of the laser
    const origin = ray.origin
      .clone()
      .add(ray.direction.clone().multiplyScalar(40));

    // Direction to camera
    // Direction to camera (with randomized offset for misses)
    let target = cam.position.clone();

    // Add a chance to miss — 30%
    let isHit = false;
    if (rngRef.current() < 0.8) {
      const missOffset = new THREE.Vector3(
        (rngRef.current() - 0.5) * 2,
        (rngRef.current() - 0.5) * 2,
        (rngRef.current() - 0.5) * 2,
      );
      target.add(missOffset);
    } else {
      isHit = true;
    }

    const dir = target.clone().sub(origin).normalize();
    const fullLength = origin.distanceTo(target);

    // Create cylinder with full length (we'll scale it up)
    const radius = 0.05;
    const geom = new THREE.CylinderGeometry(
      radius,
      radius,
      fullLength,
      8,
      1,
      true,
    );
    const mat = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 1,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const beam = new THREE.Mesh(geom, mat);

    // Align beam from Y-up → dir
    const up = new THREE.Vector3(0, 1, 0);
    const quat = new THREE.Quaternion().setFromUnitVectors(up, dir);
    beam.quaternion.copy(quat);

    // Start at origin
    beam.position.copy(origin);
    scene.add(beam);

    const growDuration = 800; // total grow time in ms
    const growStart = performance.now();

    const grow = (now: number) => {
      const elapsed = now - growStart;
      const t = Math.min(elapsed / growDuration, 1); // normalized [0,1]

      beam.scale.set(1, t, 1);
      beam.position
        .copy(origin)
        .add(dir.clone().multiplyScalar((fullLength * t) / 2));

      if (t < 1) {
        requestAnimationFrame(grow);
      } else {
        beam.scale.set(1, 1, 1);
        beam.position
          .copy(origin)
          .add(dir.clone().multiplyScalar(fullLength / 2));

        if (isHit) {
          setIsPlayerHit(true);
          setTimeout(() => setIsPlayerHit(false), 400);
        }

        requestAnimationFrame(fade);
      }
    };
    requestAnimationFrame(grow);

    //Fade out after full growth
    const startFade = performance.now();
    const fade = (t: number) => {
      const alpha = 1 - (t - startFade) / 400;
      mat.opacity = Math.max(alpha, 0);
      if (alpha > 0) requestAnimationFrame(fade);
      else {
        scene.remove(beam);
        geom.dispose();
        mat.dispose();
      }
    };
  };


  const unlimitedAmmo = false; //NEVER HAVE UNLIMITED IN CITY LOL
  useSniperHandlers({
    sceneRef,
    cameraRef,
    setShots,
    setHits,
    setIsLastShotHit,
    setSniperScopePosition,
    setIsSniperScopeVisible,
    characterRef,
    setCharacters,
    isZoomedRef,
    zoomPosRef,
    setAmmo,
    ammo,
    isReloading,
    balloonRef,
    unlimitedAmmo,
  });

  useZoomHandlers({
    setIsZoomed,
    setZoomPosition,
  });

  useEffect(() => {
    if (gameStarted && ammo !== null && ammo <= 0 && !isReloading) {
      const reloadDuration = activeGun
        ? parseFloat(
          gun_metadata[activeGun.name as keyof typeof gun_metadata].reload,
        )
        : 10; // fallback if no activeGun

      setIsReloading(true);
      setIsZoomed(false);
      setShowReloading(true);
      document.body.style.cursor = "default";
      setReloadSecondsLeft(reloadDuration);

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
        }
      };

      requestAnimationFrame(updateTimer);
    }
  }, [ammo, isReloading, maxAmmo, gameStarted, activeGun]);

  useEffect(() => {
    const socket = getSocket();

    if (!socket.connected) {
      socket.connect();
    }

    const seed = sessionStorage.getItem("matchSeed");
    const matchId = sessionStorage.getItem("matchId");


    if (seed && canvasRef.current) {
      generateCity(canvasRef.current, setCharacters, seed);
    }

    if (matchId) {
      socket.emit("ready_in_city", { roomId: matchId });
    }

    socket.on("start", ({ roomId, seed }) => {
      matchStartTimeRef.current = performance.now();
      setGameStarted(true);

      setSnipersVisible(false);
      setIntroMessage(true); // Show immediately

      setTimeout(() => {
        setIntroMessage(false);
        setSnipersVisible(true); // Show snipers right after intro disappears
      }, 3000); // Display intro message for 3s
    });


    socket.on("timer", ({ timeLeft }: { timeLeft: number }) => {
      setTimeLeft(timeLeft);
      if (timeLeft <= 0) {
        setIsGameOver(true);
      }
    });

    socket.on("shot", ({ characterId, by }: { characterId: number; by: string }) => {
      setFlashMessage(`Player ${by.slice(0, 4)}... hit an enemy!`);
      setTimeout(() => setFlashMessage(null), 2000);

      if (by === socket.id) {
        setHits((h) => h + 1);
      } else {
        setEnemyHits((h) => h + 1);
      }
    });

    socket.on("match_ended", ({ results }: { results: any[] }) => {
      const ordered = [...results].sort((a, b) => b.shotsFired - a.shotsFired);
      setMatchResults(ordered);

      // Store match results in sessionStorage for the newspaper
      sessionStorage.setItem("matchResults", JSON.stringify({
        walletA: ordered[0]?.wallet || "",
        walletB: ordered[1]?.wallet || "",
        a_kills: ordered[0]?.shotsFired || 0,
        b_kills: ordered[1]?.shotsFired || 0
      }));

      socket.disconnect();
    });

    return () => {
      socket.off("start");
      socket.off("timer");
      socket.off("shot");
      socket.off("match_ended");
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
      const startY = rngRef.current() * window.innerHeight * 0.1 + 50;
      const duration = 12 + rngRef.current() * 5;
      const size = 80 + rngRef.current() * 25;

      setBalloons((prev) => [...prev, { id, startY, duration, size }]);

      //Add to the tracking ref
      balloonRef.current.push({
        id,
        x: window.innerWidth + 150, // start off-screen right
        y: startY,
        size,
        isHit: false,
      });

      // 🔁 Schedule next spawn
      const nextDelay = 8000 + rngRef.current() * 8000;
      setTimeout(spawn, nextDelay);
    };

    spawn();
  }, []);

  // include router so ESLint is happy

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
    transform: isZoomed
      ? `scale(${activeGun ? 2 * parseFloat(gun_metadata[activeGun.name as keyof typeof gun_metadata].scope) : 1.2})`
      : "scale(1)",
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
    const savedGun = sessionStorage.getItem("selectedGun");
    if (savedGun) {
      const parsedGun: { name: keyof typeof gun_metadata } =
        JSON.parse(savedGun);
      setActiveGun(parsedGun);
      setAmmo(Number(gun_metadata[parsedGun.name].capacity));
      setMaxAmmo(Number(gun_metadata[parsedGun.name].capacity));
      setIsReloading(false);
    } else {
      // using the default sniper rifle
      setAmmo(4);
      setMaxAmmo(4);
    }
  }, []);

  useEffect(() => {
    const anyAlive = characters.some((c) => c.isSniper && !c.isHit);

    if (!anyAlive && snipersVisible) {
      if (wave >= MAX_WAVES) return; // stop everything after final wave
      if (waveLockRef.current) return; // avoid double-triggers

      waveLockRef.current = true;
      setWaveMsgVisible(true);

      setTimeout(() => {
        setWaveMsgVisible(false);
        setWave((w) => w + 1);
        nextDarkOrder = 0;
        setCharacters((prev) => addSnipers(prev));
        waveLockRef.current = false;
      }, 3000);
    }

  }, [characters, snipersVisible, wave]);

  useEffect(() => {
    if (gameStarted && ammo !== null && ammo <= 0 && !isReloading) {
      setIsReloading(true);
      setIsZoomed(false);
      setShowReloading(true);
      document.body.style.cursor = "default";
      setTimeout(() => {
        setAmmo(maxAmmo);
        setIsReloading(false);
        setShowReloading(false);
      }, 3000); // 3 seconds reload time
    }
  }, [ammo, isReloading, maxAmmo, gameStarted]);

  return (
    <>

      {matchResults && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            color: 'white',
            fontFamily: 'monospace',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
          }}
        >
          <h2 style={{ fontSize: 38, marginBottom: 24 }}>Match Results</h2>

          {matchResults.map((p, i) => (
            <div key={p.wallet} style={{ fontSize: 26, margin: '6px 0' }}>
              {i + 1}. {p.wallet.slice(0, 4)}… — {p.shotsFired} kills
            </div>
          ))}

          <button
            onClick={() => router.push('/')}
            style={{
              marginTop: 32,
              padding: '10px 24px',
              fontSize: 18,
              borderRadius: 8,
              cursor: 'pointer',
            }}
          >
            Back to Lobby
          </button>
        </div>
      )}

      {introMessage && (
        <div
          style={{
            position: "fixed",
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            padding: "20px 40px",
            backgroundColor: "rgba(0,0,0,0.85)",
            color: "red",
            fontSize: "28px",
            fontFamily: "monospace",
            textAlign: "center",
            borderRadius: "12px",
            zIndex: 9999,
            boxShadow: "0 0 20px red",
          }}
        >
          Enemy Snipers have located you!
        </div>
      )}

      {waveMsgVisible && (
        <div
          style={{
            position: "fixed",
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            padding: "18px 34px",
            backgroundColor: "rgba(0,0,0,0.85)",
            color: "gold",
            fontSize: "26px",
            fontFamily: "monospace",
            textAlign: "center",
            borderRadius: "12px",
            zIndex: 10000,
            boxShadow: "0 0 20px gold",
          }}
        >
          Your shots have awoken more snipers!
        </div>
      )}


      {flashMessage && (
        <div
          style={{
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
          }}
        >
          {flashMessage}
        </div>
      )}

      {/* <div
        style={{
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
        }}
      >
        {activeGun && <div>Now Using: {activeGun.name}</div>}
      </div> */}

      {isPlayerHit && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 99999,
            border: "10px solid red",
            boxSizing: "border-box",
            pointerEvents: "none",
            animation: "borderFlash 0.4s ease",
          }}
        />
      )}

      <div
        style={{
          position: "fixed",
          top: 20,
          left: 20,
          zIndex: 9999,
          backgroundColor: "rgba(255, 255, 255, 0.15)",
          padding: "8px 14px",
          borderRadius: "6px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            fontFamily: "monospace",
            fontSize: "16px",
            color: "white",
            textShadow: "0 0 3px black",
          }}
        >
          <div>
            Shots: <span style={{ color: "black" }}>{shots}</span> | Hits:{" "}
            <span style={{ color: flash === "hit" ? "lightgreen" : "black" }}>
              {hits}
            </span>{" "}
            | Accuracy:{" "}
            <span style={{ color: flash === "hit" ? "lightgreen" : "black" }}>
              {shots > 0 ? ((hits / shots) * 100).toFixed(1) + "%" : "0%"}
            </span>
          </div>

          <span>
            <FlippingTimer remainingTime={timeLeft} />
          </span>
        </div>

        <div
          style={{
            marginTop: "6px",
            fontFamily: "monospace",
            fontSize: "14px",
            color: "white",
            textShadow: "0 0 2px black",
          }}
        >
          Enemy Hits: <span style={{ color: "red" }}>{enemyHits}</span>
        </div>
      </div>

      <div style={wrapperStyle}>
        <div
          ref={mountRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 10,
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 1,
            cursor: isZoomed ? "none" : "default",
          }}
        />

        {!isZoomedOut && (
          <EnemySnipers
            characters={characters}
            snipersVisible={snipersVisible}
            setCharacters={setCharacters}
          />
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
          <div
            style={{
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
            }}
          >
            <div
              style={{
                position: "absolute",
                width: "0.2px",
                height: "100%",
                backgroundColor: isLastShotHit ? "red" : "gray",
              }}
            />
            <div
              style={{
                position: "absolute",
                width: "100%",
                height: "0.2px",
                backgroundColor: isLastShotHit ? "red" : "gray",
              }}
            />
          </div>
        )}

        {/* 🔥 NEW: Reload Timer showing ONLY in one place */}
        {isReloading && reloadSecondsLeft !== null && (
          <>
            {isZoomed ? (
              <div
                style={{
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
                }}
              >
                <div
                  style={{
                    color: "gold",
                    fontSize: "28px",
                    fontFamily: "monospace",
                    marginBottom: "8px",
                    textShadow: "0 0 6px black",
                  }}
                >
                  Reloading...
                </div>
                <div
                  style={{
                    color: "gold",
                    fontSize: "36px",
                    fontFamily: "monospace",
                    textShadow: "0 0 8px black",
                  }}
                >
                  {reloadSecondsLeft.toFixed(1)}
                </div>
              </div>
            ) : (
              <div
                style={{
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
                }}
              >
                <div
                  style={{
                    color: "gold",
                    fontSize: "32px",
                    fontFamily: "monospace",
                    marginBottom: "8px",
                    textShadow: "0 0 6px black",
                  }}
                >
                  Reloading...
                </div>
                <div
                  style={{
                    color: "gold",
                    fontSize: "42px",
                    fontFamily: "monospace",
                    textShadow: "0 0 8px black",
                  }}
                >
                  {reloadSecondsLeft.toFixed(1)}
                </div>
              </div>
            )}
          </>
        )}

        {/* Ammo Bar (vertical bullets) */}
        {!isReloading && isZoomed && (
          <div
            style={{
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
            }}
          >
            {Array.from({ length: maxAmmo }).map((_, index) => (
              <div
                key={index}
                style={{
                  flex: 1,
                  width: "70%",
                  backgroundColor:
                    index < ammo ? "white" : "rgba(255, 255, 255, 0.2)",
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

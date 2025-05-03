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

import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useCallback } from "react";
import { FlyingBalloon } from "./drawing/flying_balloon";


import {
  FlashMessage,
  IntroMessage,
  InfiniteAmmoToggle,
  GunDisplay,
  AmmoBar,
  ReloadTimer,
} from "./ui/game_ui";
import EnemySnipers from "./drawing/enemy_snipers";
import { addSnipers } from "./handlers/add_snipers";
import { Character } from "./types/Character";

const MAX_WAVES = 2; // maximum number of waves
const DARK_STAGGER_MS = 3000;
let nextDarkOrder = 0; // global variable to track the order of dark phases

const gun_metadata = {
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
  const [activeGun, setActiveGun] = useState<{
    name: keyof typeof gun_metadata;
  } | null>(null);
  const [isMatchmakingOpen, setIsMatchmakingOpen] = useState(false);

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
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const initGun = useRef(false);

  const { publicKey, disconnect, sendTransaction, wallet } = useWallet();
  const [flash, setFlash] = useState<"hit" | "miss" | null>(null);

  const [ammo, setAmmo] = useState<number>(0);
  const [maxAmmo, setMaxAmmo] = useState<number>(0);
  const [isReloading, setIsReloading] = useState(false);
  const [showReloading, setShowReloading] = useState(false);

  const [reloadSecondsLeft, setReloadSecondsLeft] = useState<number | null>(
    null,
  );

  const [snipersVisible, setSnipersVisible] = useState(false);
  const [introMessage, setIntroMessage] = useState(false);
  const [isPlayerHit, setIsPlayerHit] = useState(false);

  const [unlimitedAmmo, setUnlimitedAmmo] = useState(false);

  // right under other useState lines
  const [waveMsgVisible, setWaveMsgVisible] = useState(false);
  const waveLockRef = useRef(false);        // prevents double‑trigger
  const [wave, setWave] = useState(1);      // optional: track wave #


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

    socket.on("start", ({ roomId, seed }: { roomId: string; seed: string }) => {
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
              const myOrder = nextDarkOrder++; // 0, 1, 2, …
              const exitDelay = myOrder * DARK_STAGGER_MS; // 0 ms, 500 ms, …

              return {
                ...c,
                phase: "dark",
                image: "", // hide sprite
                nextPhase: now + exitDelay, // schedule dark → aggressive
              };
            }

            if (c.phase === "dark") {
              return {
                ...c,
                phase: "aggressive",
                image: "/figures/evil_sniper_2.png",
                laserCooldown: now + 700 + Math.random() * 800,
                nextPhase: undefined,
              };
            }
          }

          // laser fire every cooldown
          if (c.phase === "aggressive" && !c.isHit && now >= (c.laserCooldown ?? 0)) {
            const nextCooldown = now + 2000 + Math.random() * 1200;

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

  // ─── LASER: character ➜ camera ──────────────────────────────────────────────
  const fireLaser = (c: Character) => {
    if (!sceneRef.current || !cameraRef.current) return;

    const cam = cameraRef.current;
    const scene = sceneRef.current;

    // Apply small offset before mapping to NDC (e.g., 10px right, 20px down)
    const visualOffsetX = 8;
    const visualOffsetY = 10;

    const ndc = new THREE.Vector2(
      ((c.x + visualOffsetX) / window.innerWidth) * 2 - 1,
      -((c.y + visualOffsetY) / window.innerHeight) * 2 + 1,
    );

    // 2️⃣ Ray from screen position
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(ndc, cam);
    const ray = raycaster.ray;

    // 3️⃣ Origin of the laser
    const origin = ray.origin
      .clone()
      .add(ray.direction.clone().multiplyScalar(40));

    // 4️⃣ Direction to camera
    // 4️⃣ Direction to camera (with randomized offset for misses)
    let target = cam.position.clone();

    // Add a chance to miss — 30%
    let isHit = false;
    if (Math.random() < 0.8) {
      const missOffset = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
      );
      target.add(missOffset);
    } else {
      isHit = true;
    }

    const dir = target.clone().sub(origin).normalize();
    const fullLength = origin.distanceTo(target);

    // 5️⃣ Create cylinder with full length (we’ll scale it up)
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

    // 7️⃣ Fade out after full growth
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
    //  ⬇ add “unlimitedAmmo” here
    if (!initGun.current || isReloading || ammo > 0 || unlimitedAmmo) return;
    /* … rest of the reload logic … */
  }, [ammo, isReloading, maxAmmo, activeGun, unlimitedAmmo]);

  useEffect(() => {
    const savedGun = localStorage.getItem("selectedGun");
    if (savedGun) {
      const parsedGun: { name: keyof typeof gun_metadata } =
        JSON.parse(savedGun);
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
      ? parseFloat(
          gun_metadata[activeGun.name as keyof typeof gun_metadata].reload,
        )
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

    setSnipersVisible(false);
    setIntroMessage(false);

    setTimeout(() => {
      setIntroMessage(true);
      setTimeout(() => {
        setIntroMessage(false);
        setSnipersVisible(true);
      }, 3000); // message stays for 3s
    }, 5000); // initial wait

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
    const anyAlive = characters.some((c) => c.isSniper && !c.isHit);

    if (!anyAlive && snipersVisible) {
      if (wave >= MAX_WAVES) return; // ⛔️ stop everything after final wave
      if (waveLockRef.current) return; // ⛔️ avoid double-triggers

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
      const parsedGun: { name: keyof typeof gun_metadata } =
        JSON.parse(savedGun);
      setActiveGun(parsedGun);
      setAmmo(Number(gun_metadata[parsedGun.name].capacity));
      setMaxAmmo(Number(gun_metadata[parsedGun.name].capacity));
      setIsReloading(false);
    }
    // ❗ else do NOTHING
  }, []);

  return (
    <>
      <InfiniteAmmoToggle
        unlimitedAmmo={unlimitedAmmo}
        setUnlimitedAmmo={setUnlimitedAmmo}
      />

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


      <GunDisplay activeGun={activeGun} />

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
            flexDirection: "column",
            gap: "10px",
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
          </div>

          {!isMatchmakingOpen ? (
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
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
                Join Live Match
              </button>
            </div>
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

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 0,
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

           {isReloading && reloadSecondsLeft !== null && (
              <ReloadTimer
                 reloadSecondsLeft={reloadSecondsLeft}
                 isZoomed={isZoomed}
                 zoomPosition={zoomPosition}
              />
           )}


        <AmmoBar
          ammo={ammo}
          maxAmmo={maxAmmo}
          position={{ x: zoomPosition.x, y: zoomPosition.y }}
          isZoomed={isZoomed}
          isReloading={isReloading}
        />
      </div>
    </>
  );
};

export default Lobby;

import { useWallet } from "@solana/wallet-adapter-react";
import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import * as THREE from "three";
import { useSniperHandlers } from "./handlers/sniper_handler";
import { useZoomHandlers } from "./handlers/zoom_handler";
import { generateCity } from "./drawing/city_render";


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

const City: React.FC = () => {
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

  const { publicKey, disconnect, sendTransaction, wallet } = useWallet();

  // give handle click fresh values
  const isZoomedRef = useRef(false);
  const zoomPosRef = useRef({ x: 0, y: 0 });

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
  });

  useZoomHandlers({
    setIsZoomed,
    setZoomPosition,
  });

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

    const seed = "test123"
    generateCity(canvasRef.current!, setCharacters, seed);

    return () => {
      clearInterval(zoomCheckInterval);
      if (rendererRef.current) {
        rendererRef.current.dispose();
        mountRef.current?.removeChild(renderer.domElement);
      }

      document.body.style.cursor = "default";
    };
  }, []);

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
    if (timeLeft > 0 && !isGameOver) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      setIsGameOver(true);
    }
  }, [timeLeft, isGameOver]);

  useEffect(() => {
    const savedGun = localStorage.getItem("selectedGun");
    if (savedGun) {
      const parsedGun = JSON.parse(savedGun);
      setActiveGun(parsedGun);
    }
  }, []);

  const [matchSeed, setMatchSeed] = useState<string | null>(null);




  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 60, // Adjusted to position below the buttons
          right: 20,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          padding: "5px 15px", // Adjusted padding for smaller size
          borderRadius: "8px",
          color: "white",
          fontFamily: "monospace",
          fontSize: "16px", // Slightly smaller font size
          zIndex: 9999,
          display: "flex",
          gap: "20px",
        }}
      >
        {activeGun && <div>Now Using: {activeGun.name}</div>}
      </div>
      <div
        style={{
          position: "fixed",
          top: 20,
          left: 20,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          padding: "10px 20px",
          borderRadius: "8px",
          color: "white",
          fontFamily: "monospace",
          fontSize: "18px",
          zIndex: 9999,
          display: "flex",
          gap: "20px",
        }}
      >
        <div>
          Shots: {shots} | Hits: {hits} | Accuracy:{" "}
          {shots > 0 ? ((hits / shots) * 100).toFixed(1) : "0"}%
        </div>
        <div style={{ color: "#FFD700" }}>
          Time: {Math.floor(timeLeft / 60)}:
          {(timeLeft % 60).toString().padStart(2, "0")}
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

        {!isZoomedOut &&
          characters.map((c) => (
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
            src="city/scope.png"
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
      </div>
    </>
  );
};

export default City;

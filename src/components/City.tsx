import { useWallet } from '@solana/wallet-adapter-react';
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import * as THREE from 'three';

interface Character {
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
  visibility: ${(props) => (props.visible ? 'visible' : 'hidden')};
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
   const [sniperScopePosition, setSniperScopePosition] = useState<{ x: number; y: number } | null>(null);
   const [isSniperScopeVisible, setIsSniperScopeVisible] = useState(false);
   const [shots, setShots] = useState(0);
   const [hits, setHits] = useState(0);
   const [isLastShotHit, setIsLastShotHit] = useState(false);
   const [timeLeft, setTimeLeft] = useState(120);
   const [isGameOver, setIsGameOver] = useState(false);

   const CHARACTER_PROBABILITY = 0.1;
   const [characters, setCharacters] = useState<Character[]>([]);

   const canvasRef = useRef<HTMLCanvasElement>(null);
   const mountRef = useRef<HTMLDivElement>(null);
   const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
   const sceneRef = useRef<THREE.Scene | null>(null);
   const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
   const characterRef = useRef<Character[]>([]);

   const { publicKey, disconnect, sendTransaction, wallet } = useWallet()

   // give handle click fresh values
   const isZoomedRef = useRef(false);
   const zoomPosRef = useRef({ x: 0, y: 0 });

   useEffect(() => {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
         75,
         window.innerWidth / window.innerHeight,
         0.1,
         1000
      );
      camera.position.z = 5;

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);


      renderer.setClearColor(0x000000, 0);        // RGB = black, alpha = 0  (fully transparent)
      renderer.domElement.style.background = 'transparent';
      renderer.domElement.style.pointerEvents = 'none'; // so clicks reach your own listeners
      renderer.domElement.style.zIndex = '0';           // keep it behind the 2‑D skyline

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

      const handleClick = (e: MouseEvent) => {
         if (!sceneRef.current || !cameraRef.current) return;

         const screenX = isZoomedRef.current
            ? zoomPosRef.current.x - 55 + 50
            : e.clientX;

         const screenY = isZoomedRef.current
            ? zoomPosRef.current.y - 36 + 50
            : e.clientY;

         setShots(prev => prev + 1);

         // For debugging, always register a hit
         console.log('Shot fired at:', { screenX, screenY, isZoomed: isZoomedRef.current });

         // setHits(prev => prev + 1);

         // normalized coordinates for the cursor
         const mouse = new THREE.Vector2(
            (screenX / window.innerWidth) * 2 - 1,
            -(screenY / window.innerHeight) * 2 + 1
         );
         const raycaster = new THREE.Raycaster();
         raycaster.setFromCamera(mouse, cameraRef.current);
         const dir = raycaster.ray.direction.clone().normalize();

         // creating the laser
         const pts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1)];
         const geom = new THREE.BufferGeometry();
         geom.setFromPoints(pts);

         const mat = new THREE.LineBasicMaterial({
            color: 0xff4500,
            linewidth: isZoomedRef.current ? 10 : 1,
         });

         const line = new THREE.Line(geom, mat);

         line.position.copy(cameraRef.current.position);
         line.quaternion.copy(cameraRef.current.quaternion);
         sceneRef.current.add(line);

         const speed = 10.0,
            maxDist = 300;
         let travelled = 0;
         const fly = () => {
            travelled += speed;
            if (travelled < maxDist) {
               line.position.addScaledVector(dir, speed);
               requestAnimationFrame(fly);
            } else {
               // Show sniper scope logo at the final position
               const finalScreenPosition = new THREE.Vector3();
               finalScreenPosition.copy(line.position);
               const projected = finalScreenPosition.project(cameraRef.current!);

               const x = (projected.x * 0.5 + 0.5) * window.innerWidth;
               const y = -(projected.y * 0.5 - 0.5) * window.innerHeight;

               console.log('Final shot position:', { x, y, isZoomed: isZoomedRef.current });
               console.log('Current characters:', characterRef.current);

               const hit = characterRef.current.some(character => {
                  return x >= character.x - 15 && x <= character.x + 15 && y >= character.y - 20 && y <= character.y + 20;
               });

               if (hit) {
                  console.log('Hit detected!');
                  setHits(prev => prev + 1);
                  setIsLastShotHit(true);
               } else {
                  console.log('Miss!');
                  setIsLastShotHit(false);
               }

               setSniperScopePosition({ x, y });
               setIsSniperScopeVisible(true);

               // Hide the sniper scope logo after 2 seconds
               setTimeout(() => {
                  setIsSniperScopeVisible(false);
               }, 1000);

               sceneRef.current!.remove(line);
               geom.dispose();
               mat.dispose();
            }
         };
         fly(); // animating the laser
      };
      const originalZoom = window.devicePixelRatio;

      const checkZoom = () => {
         const currentZoom = window.devicePixelRatio;
         // Hide characters if zoom is not exactly at 100%
         setIsZoomedOut(Math.abs(currentZoom - originalZoom) > 0.1);
      };

      // Check zoom periodically
      const zoomCheckInterval = setInterval(checkZoom, 100);

      const handleKeyDown = (e: KeyboardEvent) => {
         if (e.ctrlKey) {
            setIsZoomed(true);
            document.body.style.cursor = 'none';
         }
      };

      const handleKeyUp = (e: KeyboardEvent) => {
         if (!e.ctrlKey) {
            setIsZoomed(false);
            document.body.style.cursor = 'default';
         }
      };

      const handleMouseMove = (e: MouseEvent) => {
         setZoomPosition({ x: e.clientX, y: e.clientY });
      };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('click', handleClick);

      generateCity();

      return () => {
         clearInterval(zoomCheckInterval);
         window.removeEventListener('keydown', handleKeyDown);
         window.removeEventListener('keyup', handleKeyUp);
         window.removeEventListener('mousemove', handleMouseMove);
         window.removeEventListener('click', handleClick);
         if (rendererRef.current) {
            rendererRef.current.dispose();
            mountRef.current?.removeChild(renderer.domElement);
         }

         document.body.style.cursor = 'default';
      };
   }, []);

   const generateCity = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const ratio = 4;
      canvas.width = screenWidth * ratio;
      canvas.height = screenHeight * ratio;

      ctx.scale(ratio, ratio);
      ctx.clearRect(0, 0, screenWidth, screenHeight);

      const gradient = ctx.createLinearGradient(0, 0, 0, screenHeight);
      gradient.addColorStop(0, '#87CEEB');
      gradient.addColorStop(1, '#E0F7FA');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, screenWidth, screenHeight);

      const newCharacters: Character[] = [];
      drawBuildings(ctx, screenWidth, screenHeight, newCharacters);
      setCharacters(newCharacters);
   };

   const drawBuildings = (
      ctx: CanvasRenderingContext2D,
      screenWidth: number,
      screenHeight: number,
      newCharacters: Character[]
   ) => {
      const minBuildingWidth = 40;
      const maxBuildingWidth = 80;
      const minBuildingHeight = screenHeight * 0.3;
      const maxBuildingHeight = screenHeight * 0.7;
      const minSpacing = -7;
      const maxSpacing = 10;
      const optimalBuildingCount = Math.floor(screenWidth / (minBuildingWidth / 2)) + 15;
      const roadHeight = 100;

      // Draw the road
      ctx.fillStyle = '#333333';
      ctx.fillRect(0, screenHeight - roadHeight, screenWidth, roadHeight);

      // Draw road markings
      ctx.fillStyle = '#FFFFFF';
      const lineWidth = 4;
      const lineSpacing = 30;
      for (let i = 0; i < screenWidth; i += lineSpacing) {
         ctx.fillRect(i, screenHeight - roadHeight / 2 - lineWidth / 2, lineWidth, lineWidth);
      }

      let currentX = 0;

      for (let i = 0; i < optimalBuildingCount; i++) {
         const width = Math.random() * (maxBuildingWidth - minBuildingWidth) + minBuildingWidth;
         const height = Math.random() * (maxBuildingHeight - minBuildingHeight) + minBuildingHeight;
         const spacing = Math.random() * (maxSpacing - minSpacing) + minSpacing;
         const x = i === 0 ? 0 : currentX - spacing;

         if (x > screenWidth + 200) continue;

         const color = i % 2 === 0 ? '#2C3E50' : '#34495E';
         const y = screenHeight - height - roadHeight;

         // Draw building base
         ctx.fillStyle = color;
         ctx.fillRect(x, y, width, height);

         // Draw gothic roof
         const roofHeight = Math.random() * 30 + 20;
         const spireCount = Math.floor(width / 20);
         const spireWidth = width / spireCount;

         // Draw main roof
         ctx.fillStyle = '#1A1A1A';
         for (let j = 0; j < spireCount; j++) {
            const spireX = x + j * spireWidth;
            ctx.beginPath();
            ctx.moveTo(spireX, y);
            ctx.lineTo(spireX + spireWidth / 2, y - roofHeight);
            ctx.lineTo(spireX + spireWidth, y);
            ctx.closePath();
            ctx.fill();

            // Draw decorative spire
            const spireHeight = roofHeight * 0.3;
            ctx.beginPath();
            ctx.moveTo(spireX + spireWidth / 2, y - roofHeight);
            ctx.lineTo(spireX + spireWidth / 2, y - roofHeight - spireHeight);
            ctx.lineTo(spireX + spireWidth / 2 + 2, y - roofHeight);
            ctx.closePath();
            ctx.fill();
         }

         // Draw decorative arches at the top
         const archCount = Math.floor(width / 20);
         const archWidth = width / archCount;
         ctx.fillStyle = '#E0E0E0';
         for (let j = 0; j < archCount; j++) {
            const archX = x + j * archWidth;

            // Draw main pointed arch
            ctx.beginPath();
            ctx.moveTo(archX, y - 5);
            ctx.quadraticCurveTo(
               archX + archWidth / 2, y - 15,
               archX + archWidth, y - 5
            );
            ctx.strokeStyle = '#E0E0E0';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw decorative tracery inside arch
            ctx.beginPath();
            ctx.moveTo(archX + archWidth / 2, y - 5);
            ctx.lineTo(archX + archWidth / 2, y - 10);
            ctx.stroke();

            // Draw small decorative circles at arch points
            ctx.beginPath();
            ctx.arc(archX + archWidth / 4, y - 5, 2, 0, Math.PI * 2);
            ctx.arc(archX + archWidth * 3 / 4, y - 5, 2, 0, Math.PI * 2);
            ctx.fill();

            // Draw small decorative spires above arch
            const spireHeight = 8;
            ctx.beginPath();
            ctx.moveTo(archX + archWidth / 2, y - 15);
            ctx.lineTo(archX + archWidth / 2, y - 15 - spireHeight);
            ctx.lineTo(archX + archWidth / 2 + 2, y - 15);
            ctx.closePath();
            ctx.fill();
         }

         drawWindows(ctx, x, y, width, height, newCharacters);

         currentX += width + spacing;
      }
   };

   const drawWindows = (
      ctx: CanvasRenderingContext2D,
      buildingX: number,
      buildingY: number,
      buildingWidth: number,
      buildingHeight: number,
      newCharacters: Character[]
   ) => {
      const windowWidth = 15;
      const windowHeight = 20;
      const windowSpacing = 8;
      const margin = 8;

      const maxWindowsX = Math.floor((buildingWidth - margin * 2) / (windowWidth + windowSpacing));
      const maxWindowsY = Math.floor((buildingHeight - margin * 2) / (windowHeight + windowSpacing));

      const windowsX = Math.max(1, maxWindowsX);
      const windowsY = Math.max(1, maxWindowsY);

      for (let row = 0; row < windowsY; row++) {
         for (let col = 0; col < windowsX; col++) {
            const x = buildingX + margin + col * (windowWidth + windowSpacing);
            const y = buildingY + margin + row * (windowHeight + windowSpacing);

            if (x + windowWidth > buildingX + buildingWidth - margin) continue;
            if (y + windowHeight > buildingY + buildingHeight - margin) continue;

            const isLit = Math.random() > 0.7;
            ctx.fillStyle = isLit ? '#FFD700' : '#2C3E50';
            ctx.fillRect(x, y, windowWidth, windowHeight);

            if (isLit && Math.random() < CHARACTER_PROBABILITY) {
               newCharacters.push({
                  id: Date.now() + Math.random(),
                  x,
                  y,
                  image: '/figures/better_s2.gif',
               });
               console.log('Added character:', { x, y });
            }
         }
      }
   };

   const wrapperStyle: React.CSSProperties = {
      transform: isZoomed ? 'scale(3)' : 'scale(1)',
      transformOrigin: `${zoomPosition.x}px ${zoomPosition.y}px`,
      transition: 'transform 0.2s ease',
      width: '100vw',
      height: '100vh',
      position: 'relative',
      overflow: 'hidden',
      cursor: isZoomed ? 'none' : 'default',
      marginTop: '-30px'
   };

   useEffect(() => {              // whenever isZoomed changes
      isZoomedRef.current = isZoomed;
   }, [isZoomed]);

   useEffect(() => {              // whenever zoomPos changes
      zoomPosRef.current = zoomPosition;
   }, [zoomPosition]);

   useEffect(() => {
      characterRef.current = characters;
   }, [characters]);

   useEffect(() => {
      if (timeLeft > 0 && !isGameOver) {
         const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
         }, 1000);
         return () => clearInterval(timer);
      } else if (timeLeft === 0) {
         setIsGameOver(true);
      }
   }, [timeLeft, isGameOver]);

   return (
      <>
         <div style={{
            position: 'fixed',
            top: 20,
            left: 20,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: '10px 20px',
            borderRadius: '8px',
            color: 'white',
            fontFamily: 'monospace',
            fontSize: '18px',
            zIndex: 9999,
            display: 'flex',
            gap: '20px'
         }}>
            <div>
               Shots: {shots} | Hits: {hits} | Accuracy: {shots > 0 ? ((hits / shots) * 100).toFixed(1) : '0'}%
            </div>
            <div style={{ color: '#FFD700' }}>
               Time: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
         </div>
         <div style={wrapperStyle}>
            <div
               ref={mountRef}
               style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  zIndex: 10,
               }}
            />

            <canvas
               ref={canvasRef}
               style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  zIndex: 1,
                  cursor: isZoomed ? 'none' : 'default',
               }}
            />

            {!isZoomedOut && characters.map((c) => (
               <CharacterImg key={c.id} x={c.x} y={c.y} src={c.image} alt="Character" style={{ zIndex: 2 }} />
            ))}

            {sniperScopePosition && (
               <SniperScope
                  src="city/scope.png"
                  x={sniperScopePosition.x}
                  y={sniperScopePosition.y}
                  visible={isSniperScopeVisible}
                  style={{
                     filter: isLastShotHit ? 'hue-rotate(0deg) brightness(1.5) saturate(2)' : 'none'
                  }}
               />
            )}

            {isZoomed && (
               <div
                  style={{
                     position: 'fixed',
                     top: zoomPosition.y - 36,
                     left: zoomPosition.x - 55,
                     width: 100,
                     height: 100,
                     borderRadius: '50%',
                     border: `2px solid ${isLastShotHit ? 'red' : 'gray'}`,
                     boxShadow: isLastShotHit ? '0 0 20px red' : '0 0 20px gray',
                     pointerEvents: 'none',
                     zIndex: 999,
                     display: 'flex',
                     justifyContent: 'center',
                     alignItems: 'center',
                     cursor: 'none',
                  }}
               >
                  <div
                     style={{
                        position: 'absolute',
                        width: '0.2px',
                        height: '100%',
                        backgroundColor: isLastShotHit ? 'red' : 'gray',
                     }}
                  />
                  <div
                     style={{
                        position: 'absolute',
                        width: '100%',
                        height: '0.2px',
                        backgroundColor: isLastShotHit ? 'red' : 'gray',
                     }}
                  />
               </div>
            )}
         </div>
      </>
   );
};

export default City;

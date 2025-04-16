import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

interface Character {
   id: number;
   x: number;
   y: number;
   image: string;
}

const CharacterImg = styled.img<{ x: number; y: number }>`
  position: absolute;
  left: ${(props) => props.x - 2}px;
  top: ${(props) => props.y - 1}px;
  width: 18px;
  height: auto;
  pointer-events: none;
`;

interface Sniper {
   id: number;
   x: number;
   y: number;
}

const SniperDiv = styled.div<{ x: number; y: number }>`
  position: absolute;
  width: 12px;
  height: 12px;
  background-color: black;
  border: 2px solid white;
  border-radius: 50%;
  left: ${(props) => props.x}px;
  top: ${(props) => props.y}px;
  cursor: pointer;
`;

interface Projectile {
   id: number;
   x: number;
   y: number;
   vx: number;
   vy: number;
}

const City: React.FC = () => {
   const [isZoomed, setIsZoomed] = useState(false);
   const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
   const [isZoomedOut, setIsZoomedOut] = useState(false);

   const CHARACTER_PROBABILITY = 0.1;
   const [characters, setCharacters] = useState<Character[]>([]);
   const [snipers, setSnipers] = useState<Sniper[]>([
      { id: 1, x: 200, y: 300 },
      { id: 2, x: 400, y: 350 },
      { id: 3, x: 600, y: 280 },
   ]);

   const [projectiles, setProjectiles] = useState<Projectile[]>([]);
   const canvasRef = useRef<HTMLCanvasElement>(null);

   useEffect(() => {
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

      const handleClick = (e: MouseEvent) => {
         if (isZoomed) {
            const startX = window.innerWidth - 20;
            const startY = window.innerHeight - 20;

            const targetX = zoomPosition.x;
            const targetY = zoomPosition.y;

            const dx = targetX - startX;
            const dy = targetY - startY;
            const magnitude = Math.sqrt(dx * dx + dy * dy);

            const speed = 25; // 🔥 FAST PROJECTILE
            const vx = (dx / magnitude) * speed;
            const vy = (dy / magnitude) * speed;

            const newProjectile: Projectile = {
               id: Date.now(),
               x: startX,
               y: startY,
               vx,
               vy,
            };

            setProjectiles((prev) => [...prev, newProjectile]);
         }
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
         document.body.style.cursor = 'default';
      };
   }, []);

   useEffect(() => {
      const interval = setInterval(() => {
         setProjectiles((prev) =>
            prev
               .map((p) => ({
                  ...p,
                  x: p.x + p.vx,
                  y: p.y + p.vy,
               }))
               .filter((p) => p.x > -50 && p.y > -50)
         );
      }, 30);

      return () => clearInterval(interval);
   }, []);

   const generateCity = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      canvas.width = screenWidth;
      canvas.height = screenHeight;

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
      const roadHeight = 50; // Height of the road at the bottom

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
         const y = screenHeight - height - roadHeight; // Subtract roadHeight to place buildings above the road

         ctx.fillStyle = color;
         ctx.fillRect(x, y, width, height);
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
            }
         }
      }
   };

   const wrapperStyle: React.CSSProperties = {
      transform: isZoomed ? 'scale(6)' : 'scale(1)',
      transformOrigin: `${zoomPosition.x}px ${zoomPosition.y}px`,
      transition: 'transform 0.2s ease',
      width: '100vw',
      height: '100vh',
      position: 'relative',
      overflow: 'hidden',
      cursor: isZoomed ? 'none' : 'default',
   };

   return (
      <div style={wrapperStyle}>
         <canvas
            ref={canvasRef}
            style={{
               position: 'absolute',
               top: 0,
               left: 0,
               width: '100%',
               height: '100%',
               cursor: isZoomed ? 'none' : 'default',
            }}
         />

         {!isZoomedOut && characters.map((c) => (
            <CharacterImg key={c.id} x={c.x} y={c.y} src={c.image} alt="Character" />
         ))}

         {snipers.map((sniper) => (
            <SniperDiv
               key={sniper.id}
               x={sniper.x}
               y={sniper.y}
               onClick={() => console.log(`Sniper ${sniper.id} clicked!`)}
            />
         ))}

         {projectiles.map((p) => (
            <div
               key={p.id}
               style={{
                  position: 'absolute',
                  left: p.x,
                  top: p.y,
                  width: 6,
                  height: 6,
                  backgroundColor: 'red',
                  borderRadius: '50%',
                  zIndex: 999,
                  pointerEvents: 'none',
               }}
            />
         ))}

         {isZoomed && (
            <div
               style={{
                  position: 'fixed',
                  top: zoomPosition.y - 36,
                  left: zoomPosition.x - 55,
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  border: '2px solid gray',
                  boxShadow: '0 0 20px gray',
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
                     backgroundColor: 'gray',
                  }}
               />
               <div
                  style={{
                     position: 'absolute',
                     width: '100%',
                     height: '0.2px',
                     backgroundColor: 'gray',
                  }}
               />
            </div>
         )}
      </div>
   );
};

export default City;

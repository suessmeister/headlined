import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

interface Character {
   id: number;
   x: number;
   y: number;
   image: string;
}

// simple character 1 : offset x-10, y-4
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

const City: React.FC = () => {
   const [isZoomed, setIsZoomed] = useState(false);
   const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

   // Probability that a lit window will have a character
   const CHARACTER_PROBABILITY = 0.1; // 10% for example

   // Store the characters for the lit windows
   const [characters, setCharacters] = useState<Character[]>([]);

   // Example: Some "snipers" you want to place around the city
   const [snipers, setSnipers] = useState<Sniper[]>([
      { id: 1, x: 200, y: 300 },
      { id: 2, x: 400, y: 350 },
      { id: 3, x: 600, y: 280 },
   ]);

   // Reference to the canvas element
   const canvasRef = useRef<HTMLCanvasElement>(null);

   useEffect(() => {
      const handleResize = () => {
         // Whenever window resizes, re-generate and re-draw city
         generateCity();
      };

      const handleKeyDown = (e: KeyboardEvent) => {
         if (e.ctrlKey) setIsZoomed(true);
      };

      const handleKeyUp = (e: KeyboardEvent) => {
         if (!e.ctrlKey) setIsZoomed(false);
      };

      const handleMouseMove = (e: MouseEvent) => {
         setZoomPosition({ x: e.clientX, y: e.clientY });
      };

      const handleClick = (e: MouseEvent) => {
         console.log('Clicked at', e.clientX, e.clientY);
         if (isZoomed) {
            console.log('Zoomed click');
         }
      };

      window.addEventListener('resize', handleResize);
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('click', handleClick);

      // Draw the city once on mount
      generateCity();

      return () => {
         window.removeEventListener('resize', handleResize);
         window.removeEventListener('keydown', handleKeyDown);
         window.removeEventListener('keyup', handleKeyUp);
         window.removeEventListener('mousemove', handleMouseMove);
         window.removeEventListener('click', handleClick);
      };
   }, []);

   /** 
    * Generates buildings & windows, draws them on canvas, 
    * and stores any window positions (for characters) in state.
    */
   const generateCity = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Resize canvas
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      canvas.width = screenWidth;
      canvas.height = screenHeight;

      // Clear
      ctx.clearRect(0, 0, screenWidth, screenHeight);

      // Simple sky background
      const gradient = ctx.createLinearGradient(0, 0, 0, screenHeight);
      gradient.addColorStop(0, '#87CEEB');
      gradient.addColorStop(1, '#E0F7FA');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, screenWidth, screenHeight);

      // We'll collect new character data here
      const newCharacters: Character[] = [];

      // Draw random buildings
      drawBuildings(ctx, screenWidth, screenHeight, newCharacters);

      // Once we finish generating windows, update the characters in state
      setCharacters(newCharacters);
   };

   /**
    * Draw all buildings on the canvas. 
    * Also calls `drawWindows()` which may push characters into newCharacters.
    */
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

      const optimalBuildingCount =
         Math.floor(screenWidth / (minBuildingWidth / 2)) + 15;

      let currentX = 0;

      for (let i = 0; i < optimalBuildingCount; i++) {
         const width =
            Math.random() * (maxBuildingWidth - minBuildingWidth) +
            minBuildingWidth;
         const height =
            Math.random() * (maxBuildingHeight - minBuildingHeight) +
            minBuildingHeight;
         const spacing = Math.random() * (maxSpacing - minSpacing) + minSpacing;
         const x = i === 0 ? 0 : currentX - spacing;

         // Skip if off screen
         if (x > screenWidth + 200) continue;

         // Alternate building colors
         const color = i % 2 === 0 ? '#2C3E50' : '#34495E';
         const y = screenHeight - height; // align to bottom

         ctx.fillStyle = color;
         ctx.fillRect(x, y, width, height);

         // Draw windows & fill newCharacters if needed
         drawWindows(ctx, x, y, width, height, newCharacters);

         currentX += width + spacing;
      }
   };

   /**
    * Draw windows for one building. 
    * For each lit window, there's a CHARACTER_PROBABILITY chance to place a character.
    * We'll add a character's (x, y, image) to `newCharacters` if we decide to spawn one.
    */
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

      // Figure out how many windows fit
      const maxWindowsX = Math.floor(
         (buildingWidth - margin * 2) / (windowWidth + windowSpacing)
      );
      const maxWindowsY = Math.floor(
         (buildingHeight - margin * 2) / (windowHeight + windowSpacing)
      );

      const windowsX = Math.max(1, maxWindowsX);
      const windowsY = Math.max(1, maxWindowsY);

      for (let row = 0; row < windowsY; row++) {
         for (let col = 0; col < windowsX; col++) {
            const x = buildingX + margin + col * (windowWidth + windowSpacing);
            const y = buildingY + margin + row * (windowHeight + windowSpacing);

            // Skip if it overflows
            if (x + windowWidth > buildingX + buildingWidth - margin) continue;
            if (y + windowHeight > buildingY + buildingHeight - margin) continue;

            // Is this window lit?
            const isLit = Math.random() > 0.7;

            // Fill window color
            ctx.fillStyle = isLit ? '#FFD700' : '#2C3E50';
            ctx.fillRect(x, y, windowWidth, windowHeight);

            // Maybe place a character
            if (isLit && Math.random() < CHARACTER_PROBABILITY) {
               newCharacters.push({
                  id: Date.now() + Math.random(), // or any unique ID
                  x,
                  y,
                  image: '/figures/better_s2.gif', // Path to your PNG
               });
            }
         }
      }
   };

   // Magnifying-glass style scaling
   const wrapperStyle: React.CSSProperties = {
      transform: isZoomed ? 'scale(6)' : 'scale(1)',
      transformOrigin: `${zoomPosition.x}px ${zoomPosition.y}px`,
      transition: 'transform 0.2s ease',
      width: '100vw',
      height: '100vh',
      position: 'relative',
      overflow: 'hidden',
   };

   return (
      <div style={wrapperStyle}>
         {/* The canvas for the city background */}
         <canvas
            ref={canvasRef}
            style={{
               position: 'absolute',
               top: 0,
               left: 0,
               width: '100%',
               height: '100%',
            }}
         />

         {/* Render each randomly placed character as an absolutely positioned <img> */}
         {characters.map((c) => (
            <CharacterImg
               key={c.id}
               x={c.x}
               y={c.y}
               src={'/figures/better_s2.gif'}
               alt="Character"
            />
         ))}

         {/* The absolutely positioned snipers on top (or you could merge them with characters) */}
         {snipers.map((sniper) => (
            <SniperDiv
               key={sniper.id}
               x={sniper.x}
               y={sniper.y}
               onClick={() => {
                  console.log(`Sniper ${sniper.id} clicked!`);
               }}
            />
         ))}

         {/* If zoomed, show the circular magnifying overlay */}
         {isZoomed && (
            <div
               style={{
                  position: 'fixed',
                  top: zoomPosition.y - 100,
                  left: zoomPosition.x - 100,
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  border: '2px solid gray',
                  boxShadow: '0 0 20px gray',
                  pointerEvents: 'none',
                  zIndex: 999,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
               }}
            >
               {/* Crosshair lines */}
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

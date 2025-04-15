import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

/** Example sniper interface: might hold additional info in real usage. */
interface Sniper {
   id: number;
   x: number;  // The absolute x-position on the canvas/screen
   y: number;  // The absolute y-position on the canvas/screen
}

/** A simple styled div representing one sniper. */
const SniperDiv = styled.div<{ x: number; y: number }>`
  position: absolute;
  width: 20px;
  height: 20px;
  background-color: black;
  border: 2px solid white;
  border-radius: 50%;
  left: ${(props) => props.x}px;
  top: ${(props) => props.y}px;
  cursor: pointer;
`;

/** Main City component. */
const City: React.FC = () => {
   const [isZoomed, setIsZoomed] = useState(false);
   const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

   // Example: Some "snipers" you want to place around the city
   const [snipers, setSnipers] = useState<Sniper[]>([
      { id: 1, x: 200, y: 300 },
      { id: 2, x: 400, y: 350 },
      { id: 3, x: 600, y: 280 },
   ]);

   // Reference to the canvas element
   const canvasRef = useRef<HTMLCanvasElement>(null);

   useEffect(() => {
      // Attach event listeners
      const handleResize = () => {
         drawCity(); // re-draw city on resize
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
            // If you want to do something special when ctrl is held down
            console.log('Zoomed click');
         }
      };

      window.addEventListener('resize', handleResize);
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('click', handleClick);

      // Draw the city once when the component mounts
      drawCity();

      return () => {
         window.removeEventListener('resize', handleResize);
         window.removeEventListener('keydown', handleKeyDown);
         window.removeEventListener('keyup', handleKeyUp);
         window.removeEventListener('mousemove', handleMouseMove);
         window.removeEventListener('click', handleClick);
      };
   }, []);

   /** Draw the city onto the canvas. */
   const drawCity = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Resize canvas to match current window size
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      canvas.width = screenWidth;
      canvas.height = screenHeight;

      // Clear it
      ctx.clearRect(0, 0, screenWidth, screenHeight);

      // Simple gradient sky background
      const gradient = ctx.createLinearGradient(0, 0, 0, screenHeight);
      gradient.addColorStop(0, '#87CEEB');
      gradient.addColorStop(1, '#E0F7FA');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, screenWidth, screenHeight);

      // Draw some random buildings for decoration
      drawBuildings(ctx, screenWidth, screenHeight);
   };

   /** Draw buildings and windows on the canvas. */
   const drawBuildings = (
      ctx: CanvasRenderingContext2D,
      screenWidth: number,
      screenHeight: number
   ) => {
      const minBuildingWidth = 40;
      const maxBuildingWidth = 80;
      const minBuildingHeight = screenHeight * 0.3;
      const maxBuildingHeight = screenHeight * 0.7;
      const minSpacing = -7;
      const maxSpacing = 10;

      const optimalBuildingCount = Math.floor(screenWidth / (minBuildingWidth / 2)) + 15;
      let currentX = 0;

      for (let i = 0; i < optimalBuildingCount; i++) {
         const width =
            Math.random() * (maxBuildingWidth - minBuildingWidth) + minBuildingWidth;
         const height =
            Math.random() * (maxBuildingHeight - minBuildingHeight) + minBuildingHeight;
         const spacing = Math.random() * (maxSpacing - minSpacing) + minSpacing;
         const x = i === 0 ? 0 : currentX - spacing;

         // Skip if off screen
         if (x > screenWidth + 200) continue;

         // Alternate colors
         const color = i % 2 === 0 ? '#2C3E50' : '#34495E';
         const y = screenHeight - height; // so it "stands" from bottom

         // Draw the building
         ctx.fillStyle = color;
         ctx.fillRect(x, y, width, height);

         // Optionally, draw windows
         drawWindows(ctx, x, y, width, height);

         currentX += width + spacing;
      }
   };

   /** Draw windows on a single building rectangle. */
   const drawWindows = (
      ctx: CanvasRenderingContext2D,
      buildingX: number,
      buildingY: number,
      buildingWidth: number,
      buildingHeight: number
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

            // Skip if outside building
            if (x + windowWidth > buildingX + buildingWidth - margin) continue;
            if (y + windowHeight > buildingY + buildingHeight - margin) continue;

            // Randomly lit
            const isLit = Math.random() > 0.7;

            ctx.fillStyle = isLit ? '#FFD700' : '#2C3E50';
            ctx.fillRect(x, y, windowWidth, windowHeight);
         }
      }
   };

   /** Handle the magnifying-glass style scaling. */
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
         {/* The canvas used for the decorative city background */}
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

         {/* The absolutely positioned snipers on top of the canvas */}
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

         {/* The circular magnifying glass overlay if zoomed */}
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
                     width: '1px',
                     height: '100%',
                     backgroundColor: 'gray',
                  }}
               />
               <div
                  style={{
                     position: 'absolute',
                     width: '100%',
                     height: '1px',
                     backgroundColor: 'gray',
                  }}
               />
            </div>
         )}
      </div>
   );
};

export default City;

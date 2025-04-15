import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

interface Building {
   id: number;
   x: number;
   width: number;
   height: number;
   windows: Window[];
   color: string;
}

interface Window {
   id: number;
   x: number;
   y: number;
   width: number;
   height: number;
   isLit: boolean;
}

interface BuildingProps {
   x: number;
   width: number;
   height: number;
   color: string;
}

interface WindowProps {
   x: number;
   y: number;
   width: number;
   height: number;
   isLit: boolean;
}

const CityContainer = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(to bottom, #87CEEB, #E0F7FA);
  overflow: hidden;
`;

const Building = styled.div<BuildingProps>`
  position: absolute;
  left: ${(props) => props.x}px;
  bottom: 0;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  background-color: ${(props) => props.color};
  border: 2px solid ${(props) => props.color};
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
`;

const Window = styled.div<WindowProps>`
  position: absolute;
  left: ${(props) => props.x}px;
  top: ${(props) => props.y}px;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  background-color: ${(props) => (props.isLit ? '#FFD700' : '#2C3E50')};
  border: 1px solid ${(props) => (props.isLit ? '#F39C12' : '#34495E')};
  box-shadow: ${(props) => (props.isLit ? '0 0 10px #FFD700' : 'none')};
  transition: all 0.3s ease;
`;

const City: React.FC = () => {
   const [buildings, setBuildings] = useState<Building[]>([]);
   const [isZoomed, setIsZoomed] = useState(false);
   const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

   let buildingId = 0;
   let windowId = 0;

   useEffect(() => {
      const handleResize = () => {
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

      window.addEventListener('resize', handleResize);
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      window.addEventListener('mousemove', handleMouseMove);

      generateCity();

      return () => {
         window.removeEventListener('resize', handleResize);
         window.removeEventListener('keydown', handleKeyDown);
         window.removeEventListener('keyup', handleKeyUp);
         window.removeEventListener('mousemove', handleMouseMove);
      };
   }, []);

   const generateCity = () => {
      const newBuildings: Building[] = [];
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      const minBuildingWidth = 40;
      const maxBuildingWidth = 80;
      const minBuildingHeight = screenHeight * 0.3;
      const maxBuildingHeight = screenHeight * 0.7;
      const minSpacing = -7;
      const maxSpacing = 10;

      const optimalBuildingCount = Math.floor(screenWidth / (minBuildingWidth / 2)) + 15;

      let currentX = 0;

      for (let i = 0; i < optimalBuildingCount; i++) {
         const width = Math.random() * (maxBuildingWidth - minBuildingWidth) + minBuildingWidth;
         const height = Math.random() * (maxBuildingHeight - minBuildingHeight) + minBuildingHeight;
         const spacing = Math.random() * (maxSpacing - minSpacing) + minSpacing;
         const x = i === 0 ? 0 : currentX - spacing;

         if (x > screenWidth + 200) continue;

         const windows = generateWindows(width, height);
         const color = i % 2 === 0 ? '#2C3E50' : '#34495E';

         newBuildings.push({
            id: buildingId++,
            x,
            width,
            height,
            windows,
            color
         });

         currentX += width + spacing;
      }

      setBuildings(newBuildings);
   };

   const generateWindows = (buildingWidth: number, buildingHeight: number): Window[] => {
      const windows: Window[] = [];
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
            const x = margin + col * (windowWidth + windowSpacing);
            const y = margin + row * (windowHeight + windowSpacing);

            if (x + windowWidth > buildingWidth - margin) continue;
            if (y + windowHeight > buildingHeight - margin) continue;

            windows.push({
               id: windowId++,
               x,
               y,
               width: windowWidth,
               height: windowHeight,
               isLit: Math.random() > 0.7
            });
         }
      }

      return windows;
   };

   return (
      <div
         style={{
            transform: isZoomed ? `scale(3)` : 'scale(1)',
            transformOrigin: `${zoomPosition.x}px ${zoomPosition.y}px`,
            transition: 'transform 0.2s ease',
            width: '100vw',
            height: '100vh',
            position: 'relative',
            overflow: 'hidden',
         }}
      >
         <CityContainer>
            {buildings.map((building) => (
               <Building
                  key={building.id}
                  x={building.x}
                  width={building.width}
                  height={building.height}
                  color={building.color}
               >
                  {building.windows.map((window) => (
                     <Window
                        key={window.id}
                        x={window.x}
                        y={building.height - window.y - window.height}
                        width={window.width}
                        height={window.height}
                        isLit={window.isLit}
                     />
                  ))}
               </Building>
            ))}
         </CityContainer>

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

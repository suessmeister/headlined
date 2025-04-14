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
  left: ${(props: BuildingProps) => props.x}px;
  bottom: 0;
  width: ${(props: BuildingProps) => props.width}px;
  height: ${(props: BuildingProps) => props.height}px;
  background-color: ${(props: BuildingProps) => props.color};
  border: 2px solid ${(props: BuildingProps) => props.color};
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
`;

const Window = styled.div<WindowProps>`
  position: absolute;
  left: ${(props: WindowProps) => props.x}px;
  top: ${(props: WindowProps) => props.y}px;
  width: ${(props: WindowProps) => props.width}px;
  height: ${(props: WindowProps) => props.height}px;
  background-color: ${(props: WindowProps) => props.isLit ? '#FFD700' : '#2C3E50'};
  border: 1px solid ${(props: WindowProps) => props.isLit ? '#F39C12' : '#34495E'};
  box-shadow: ${(props: WindowProps) => props.isLit ? '0 0 10px #FFD700' : 'none'};
  transition: all 0.3s ease;
`;

const City: React.FC = () => {
   const [buildings, setBuildings] = useState<Building[]>([]);
   let buildingId = 0;
   let windowId = 0;

   useEffect(() => {
      const handleResize = () => {
         generateCity();
      };

      window.addEventListener('resize', handleResize);
      generateCity();

      return () => {
         window.removeEventListener('resize', handleResize);
      };
   }, []);

   const generateCity = () => {
      const newBuildings: Building[] = [];
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      const minBuildingWidth = 80;
      const maxBuildingWidth = 160;
      const minBuildingHeight = screenHeight * 0.3;
      const maxBuildingHeight = screenHeight * 0.7;
      const minSpacing = -5;
      const maxSpacing = 20;

      const buildingCount = Math.floor(screenWidth / (minBuildingWidth / 3)) + 10;

      let currentX = 0;

      for (let i = 0; i < buildingCount; i++) {
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
      const windowWidth = 20;
      const windowHeight = 30;
      const windowSpacing = 12;
      const margin = 12;

      const maxWindowsX = Math.floor((buildingWidth - (margin * 2)) / (windowWidth + windowSpacing));
      const maxWindowsY = Math.floor((buildingHeight - (margin * 2)) / (windowHeight + windowSpacing));

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
      <CityContainer>
         {buildings.map(building => (
            <Building
               key={building.id}
               x={building.x}
               width={building.width}
               height={building.height}
               color={building.color}
            >
               {building.windows.map(window => (
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
   );
};

export default City; 
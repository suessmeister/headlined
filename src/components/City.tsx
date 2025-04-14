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
      let buildingId = 0;
      let windowId = 0;

      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      // Calculate optimal building count based on screen width
      const minBuildingWidth = 150;
      const maxBuildingWidth = 250;
      const buildingSpacing = 30;
      const buildingCount = Math.floor(screenWidth / (minBuildingWidth + buildingSpacing)) + 2; // Add 2 more buildings

      // Building color palette
      const buildingColors = [
         '#2C3E50', // Dark blue-gray
         '#34495E', // Slightly lighter blue-gray
         '#2C3E50', // Dark blue-gray
         '#34495E', // Slightly lighter blue-gray
         '#2C3E50'  // Dark blue-gray
      ];

      let currentX = 0;

      // Generate buildings
      for (let i = 0; i < buildingCount; i++) {
         // Ensure buildings don't overlap and have consistent spacing
         const width = Math.floor(Math.random() * (maxBuildingWidth - minBuildingWidth)) + minBuildingWidth;
         const height = Math.floor(Math.random() * (screenHeight * 0.5)) + (screenHeight * 0.3);

         // Ensure buildings don't go off screen
         if (currentX + width > screenWidth) {
            break;
         }

         const windows: Window[] = [];
         // Generate windows with better spacing
         const windowRows = Math.floor(height / 100); // More space between rows
         const windowCols = Math.floor(width / 50);   // More space between columns

         for (let row = 0; row < windowRows; row++) {
            for (let col = 0; col < windowCols; col++) {
               const windowX = col * 50 + 25;  // Increased spacing
               const windowY = row * 100 + 25; // Increased spacing
               const isLit = Math.random() > 0.5; // Random window lighting

               windows.push({
                  id: windowId++,
                  x: windowX,
                  y: windowY,
                  width: 35,
                  height: 50,
                  isLit
               });
            }
         }

         newBuildings.push({
            id: buildingId++,
            x: currentX,
            width,
            height,
            windows,
            color: buildingColors[i % buildingColors.length]
         });

         currentX += width + buildingSpacing;
      }

      setBuildings(newBuildings);
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
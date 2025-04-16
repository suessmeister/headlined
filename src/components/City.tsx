import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import * as THREE from 'three';


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




const City: React.FC = () => {
   const [isZoomed, setIsZoomed] = useState(false);
   const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
   const [isZoomedOut, setIsZoomedOut] = useState(false);

   const CHARACTER_PROBABILITY = 0.1;
   const [characters, setCharacters] = useState<Character[]>([]);

   const canvasRef = useRef<HTMLCanvasElement>(null);
   const mountRef = useRef<HTMLDivElement>(null);
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
      renderer.setSize(window.innerWidth, window.innerHeight);
      mountRef.current?.appendChild(renderer.domElement);

      const light = new THREE.DirectionalLight(0xffffff, 1);
      light.position.set(1, 1, 1);
      scene.add(light);

      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      const handleClick = (e: MouseEvent) => {
         // gotta convert mouse to 2d vector
         mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
         mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

         raycaster.setFromCamera(mouse, camera);

         const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
         const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
         const projectile = new THREE.Mesh(geometry, material);
         scene.add(projectile);

         const direction = raycaster.ray.direction.clone();

         const speed = 0.1;
         const target = camera.position.clone().add(direction.multiplyScalar(100));
         const animateProjectile = () => {
            const distance = projectile.position.distanceTo(target);
            if (distance > 1) {
               //console.log('distance', distance);
               projectile.translateZ(-speed);
               requestAnimationFrame(animateProjectile);
               renderer.render(scene, camera);
            } else {
               scene.remove(projectile);
            }
         }
         animateProjectile();

      }

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
         mountRef.current?.removeChild(renderer.domElement);
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
            }
         }
      }
   };

   const wrapperStyle: React.CSSProperties = {
      transform: isZoomed ? 'scale(8)' : 'scale(1)',
      transformOrigin: `${zoomPosition.x}px ${zoomPosition.y}px`,
      transition: 'transform 0.2s ease',
      width: '100vw',
      height: '100vh',
      position: 'relative',
      overflow: 'hidden',
      cursor: isZoomed ? 'none' : 'default',
      marginTop: '-30px'
   };

   return (
      <div style={wrapperStyle}>
         <div ref={mountRef} 
         style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            zIndex: 0
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

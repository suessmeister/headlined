/*  City.tsx  – “just make a red 2‑D line shoot into the screen”  */
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import * as THREE from 'three';

/* ---------- styled‑components & types ---------- */
interface Character {
   id: number;
   x: number;
   y: number;
   image: string;
}

const CharacterImg = styled.img<{ x: number; y: number }>`
  position: absolute;
  left: ${(p) => p.x - 2}px;
  top:  ${(p) => p.y - 1}px;
  width: 18px;
  height: auto;
  pointer-events: none;
`;

/* =================================================
   Main component
   =================================================*/
const City: React.FC = () => {
   /* -------- UI state -------- */
   const [isZoomed, setIsZoomed] = useState(false);
   const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
   const [isZoomedOut, setHideChars] = useState(false);

   /* -------- character sprites -------- */
   const CHARACTER_PROB = 0.10;
   const [characters, setCharacters] = useState<Character[]>([]);

   /* -------- refs -------- */
   const canvasRef = useRef<HTMLCanvasElement>(null);   // 2‑D skyline
   const mountRef = useRef<HTMLDivElement>(null);      // three.js canvas mount

   const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
   const sceneRef = useRef<THREE.Scene | null>(null);
   const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
   // live snapshots of zoom state, so handleClick always has fresh values
   const isZoomedRef = useRef(false);
   const zoomPosRef = useRef({ x: 0, y: 0 });


   /* =================================================
      side‑effect: three.js setup + click‑laser
      =================================================*/
   useEffect(() => {
      /* ---- create THREE objects ---- */
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
         75,
         window.innerWidth / window.innerHeight,
         0.1,
         1000
      );
      camera.position.z = 5;

      // OLD
      // const renderer = new THREE.WebGLRenderer({ antialias: true });
      // renderer.setPixelRatio(window.devicePixelRatio);
      // renderer.setSize(window.innerWidth, window.innerHeight);

      const renderer = new THREE.WebGLRenderer({
         antialias: true,
         alpha: true          // ⬅️  allow transparent background
      });
      renderer.setClearColor(0x000000, 0); // ⬅️  RGB black, ALPHA 0 (fully transparent)
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.domElement.style.background = 'transparent';
      renderer.domElement.style.pointerEvents = 'none';  // clicks pass through
      renderer.domElement.style.zIndex = '0';            // keep it behind skyline


      mountRef.current?.appendChild(renderer.domElement);

      /* store in refs */
      sceneRef.current = scene;
      cameraRef.current = camera;
      rendererRef.current = renderer;

      /* continuous render loop */
      const renderLoop = () => {
         renderer.render(scene, camera);
         requestAnimationFrame(renderLoop);
      };
      renderLoop();

      /* ---- SHOOT LASER on click ---- */
      const handleClick = (e: MouseEvent) => {
         if (!sceneRef.current || !cameraRef.current) return;

         /* -------------------------------------------------
          * Choose screen coordinates for the ray origin
          * -------------------------------------------------
          * • If we’re zoomed‑in (Ctrl held), use the centre
          *   of the circular scope, NOT the mouse location.
          * • Otherwise, keep the raw mouse click.
          *
          * The scope div is 100 × 100 px and its top‑left
          * corner is at (zoomPos.x‑55,  zoomPos.y‑36).
          * So its centre is (+50 px, +50 px) from there.
          * -------------------------------------------------*/
         const screenX = isZoomedRef.current
            ? zoomPosRef.current.x - 55 + 50 // centre of scope on X
            : e.clientX;

         const screenY = isZoomedRef.current
            ? zoomPosRef.current.y - 36 + 50 // centre of scope on Y
            : e.clientY;

         // convert to Normalised Device Co‑ordinates
         const mouse = new THREE.Vector2(
            (screenX / window.innerWidth) * 2 - 1,
            -(screenY / window.innerHeight) * 2 + 1
         );

         const raycaster = new THREE.Raycaster();
         raycaster.setFromCamera(mouse, cameraRef.current);
         const dir = raycaster.ray.direction.clone().normalize();

         /* 1‑unit line in local space */
         const pts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1)];
         const geom = new THREE.BufferGeometry();
         geom.setFromPoints(pts);
         const mat = new THREE.LineBasicMaterial({ color: 0xff0000 });
         const line = new THREE.Line(geom, mat);

         line.position.copy(cameraRef.current.position);
         line.quaternion.copy(cameraRef.current.quaternion);
         sceneRef.current.add(line);

         /* animate forward */
         const speed = 1.5, maxDist = 300;
         let travelled = 0;
         const fly = () => {
            travelled += speed;
            if (travelled < maxDist) {
               line.position.addScaledVector(dir, speed);
               requestAnimationFrame(fly);
            } else {
               sceneRef.current!.remove(line);
               geom.dispose();
               mat.dispose();
            }
         };
         fly();
      };

      /* ---- misc helpers (unchanged) ---- */
      const originalZoom = window.devicePixelRatio;
      const zoomCheck = () => setHideChars(Math.abs(window.devicePixelRatio - originalZoom) > 0.1);
      const zoomInterval = setInterval(zoomCheck, 100);

      const handleKeyDown = (ev: KeyboardEvent) => {
         if (ev.ctrlKey) {
            setIsZoomed(true);
            document.body.style.cursor = 'none';
         }
      };
      const handleKeyUp = (ev: KeyboardEvent) => {
         if (!ev.ctrlKey) {
            setIsZoomed(false);
            document.body.style.cursor = 'default';
         }
      };
      const handleMouseMove = (ev: MouseEvent) => setZoomPos({ x: ev.clientX, y: ev.clientY });

      /* ---- listeners ---- */
      window.addEventListener('click', handleClick);
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
      window.addEventListener('mousemove', handleMouseMove);

      /* ---- skyline paint once ---- */
      generateCity();

      /* ---- cleanup ---- */
      return () => {
         clearInterval(zoomInterval);
         window.removeEventListener('click', handleClick);
         window.removeEventListener('keydown', handleKeyDown);
         window.removeEventListener('keyup', handleKeyUp);
         window.removeEventListener('mousemove', handleMouseMove);

         if (rendererRef.current) {
            rendererRef.current.dispose();
            mountRef.current?.removeChild(rendererRef.current.domElement);
         }
         document.body.style.cursor = 'default';
      };
   }, []);

   /* =================================================
      2‑D skyline functions (original, trimmed slightly)
      =================================================*/
   const generateCity = () => {
      const canvas = canvasRef.current; if (!canvas) return;
      const ctx = canvas.getContext('2d'); if (!ctx) return;

      const W = window.innerWidth, H = window.innerHeight, ratio = 4;
      canvas.width = W * ratio; canvas.height = H * ratio;
      ctx.scale(ratio, ratio);
      ctx.clearRect(0, 0, W, H);

      /* sky gradient */
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, '#87CEEB'); grad.addColorStop(1, '#E0F7FA');
      ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);

      /* road */
      const roadH = 100;
      ctx.fillStyle = '#333'; ctx.fillRect(0, H - roadH, W, roadH);
      ctx.fillStyle = '#FFF';
      for (let i = 0; i < W; i += 30) ctx.fillRect(i, H - roadH / 2 - 2, 4, 4);

      /* buildings + windows */
      const minW = 40, maxW = 80, minH = H * 0.3, maxH = H * 0.7;
      const newChars: Character[] = [];
      let xPos = 0;

      const drawWin = (bx: number, by: number, bw: number, bh: number) => {
         const wW = 15, wH = 20, gap = 8, margin = 8;
         const cols = Math.max(1, Math.floor((bw - margin * 2) / (wW + gap)));
         const rows = Math.max(1, Math.floor((bh - margin * 2) / (wH + gap)));
         for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
               const wx = bx + margin + c * (wW + gap);
               const wy = by + margin + r * (wH + gap);
               if (wx + wW > bx + bw - margin || wy + wH > by + bh - margin) continue;
               const lit = Math.random() > 0.7;
               ctx.fillStyle = lit ? '#FFD700' : '#2C3E50';
               ctx.fillRect(wx, wy, wW, wH);
               if (lit && Math.random() < CHARACTER_PROB) {
                  newChars.push({ id: Date.now() + Math.random(), x: wx, y: wy, image: '/figures/better_s2.gif' });
               }
            }
         }
      };

      const targetCount = Math.floor(W / (minW / 2)) + 15;
      for (let i = 0; i < targetCount; i++) {
         const bw = Math.random() * (maxW - minW) + minW;
         const bh = Math.random() * (maxH - minH) + minH;
         const spacing = Math.random() * 17 - 7;
         const bx = i === 0 ? 0 : xPos - spacing;
         if (bx > W + 200) continue;
         const by = H - bh - roadH;
         ctx.fillStyle = i % 2 === 0 ? '#2C3E50' : '#34495E';
         ctx.fillRect(bx, by, bw, bh);
         drawWin(bx, by, bw, bh);
         xPos += bw + spacing;
      }
      setCharacters(newChars);
   };

   /* =================================================
      Render
      =================================================*/
   const wrapperStyle: React.CSSProperties = {
      transform: isZoomed ? 'scale(6)' : 'scale(1)',
      transformOrigin: `${zoomPos.x}px ${zoomPos.y}px`,
      transition: 'transform 0.2s ease',
      width: '100vw',
      height: '100vh',
      position: 'relative',
      overflow: 'hidden',
      cursor: isZoomed ? 'none' : 'default',
      marginTop: -30
   };

   useEffect(() => {              // whenever isZoomed changes
      isZoomedRef.current = isZoomed;
   }, [isZoomed]);

   useEffect(() => {              // whenever zoomPos changes
      zoomPosRef.current = zoomPos;
   }, [zoomPos]);

   return (
      <div style={wrapperStyle}>
         {/* three.js canvas mount */}
         <div ref={mountRef} style={{ position: 'absolute', inset: 0, zIndex: 0 }} />

         {/* 2‑D skyline */}
         <canvas
            ref={canvasRef}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1 }}
         />

         {/* window characters */}
         {!isZoomedOut && characters.map(c => (
            <CharacterImg key={c.id} x={c.x} y={c.y} src={c.image} alt="Character" style={{ zIndex: 2 }} />
         ))}

         {/* magnifier cross‑hair */}
         {isZoomed && (
            <div
               style={{
                  position: 'fixed',
                  top: zoomPos.y - 36,
                  left: zoomPos.x - 55,
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
               <div style={{ position: 'absolute', width: 0.2, height: '100%', background: 'gray' }} />
               <div style={{ position: 'absolute', width: '100%', height: 0.2, background: 'gray' }} />
            </div>
         )}
      </div>
   );
};

export default City;

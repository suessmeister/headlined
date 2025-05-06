import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { Character } from "../types/Character";


interface Props {
   characters: Character[];
   snipersVisible: boolean;
   setCharacters: React.Dispatch<React.SetStateAction<Character[]>>;
}

/* ───────────────── styled components ───────────────── */
const SniperImg = styled(motion.img) <{ x: number; y: number }>`
  position: absolute;
  left: ${({ x }) => x - 2}px;
  top:  ${({ y }) => y - 1}px;
  width: 18px;
  height: auto;
  pointer-events: none;
  z-index: 2;
`;

const SkullWrapper = styled.div<{ x: number; y: number }>`
  position: absolute;
  left: ${({ x }) => x - 14}px;   // 🔁 shifted right
  top: ${({ y }) => y - 3}px;   // 🔁 shifted down
  z-index: 11;
  text-align: center;
  pointer-events: none;
`;


const Skull = styled.div`
  font-size: 8px;
  color: white;
  text-shadow: 0 0 2px black;
  line-height: 1;
`;

const Coffin = styled.div`
  font-size: 10px;
  color: white;
  text-shadow: 0 0 2px black;
  line-height: 1;
  margin-top: 2px;
`;

const Wings = styled(motion.div)`
  font-size: 11px;
  color: white;
  text-shadow: 0 0 2px black;
  line-height: 1;
  margin-top: 2px;
  letter-spacing: 4px;  // space them out
`;




/* ───────────────── component ───────────────── */
const EnemySnipers: React.FC<Props> = ({
   characters,
   snipersVisible,
   setCharacters,
}) => {
   const containerRef = useRef<HTMLDivElement>(null);
   const [deadSnipers, setDeadSnipers] = useState<number[]>([]);

   /* keep updating screen coords (same idea as FlyingBalloon) */
   useEffect(() => {
      let raf: number;

      const syncCoords = () => {
         setCharacters(prev =>
            prev.map(c =>
               !c.isSniper || c.isHit
                  ? c
                  : { ...c, screenX: c.x, screenY: c.y, radius: 10 },
            ),
         );
         raf = requestAnimationFrame(syncCoords);
      };

      raf = requestAnimationFrame(syncCoords);
      return () => cancelAnimationFrame(raf);
   }, [setCharacters]);

   /* if characters array marks a sniper hit, push to deadSnipers
      (mirrors balloon “isHit → setIsHit” transition)              */
   useEffect(() => {
      const newlyDead = characters
         .filter(c => c.isSniper && c.isHit && !deadSnipers.includes(c.id))
         .map(c => c.id);

      if (newlyDead.length) setDeadSnipers(prev => [...prev, ...newlyDead]);
   }, [characters, deadSnipers]);

   return (
      <div ref={containerRef}>
         {characters.map(c => {
            if (c.phase === "dark" || (!snipersVisible && c.isSniper)) return null;


            const isDead = c.isSniper && c.isHit;
            const showSkull = deadSnipers.includes(c.id);

            const screenWidth = window.innerWidth;
            const screenHeight = window.innerHeight;
            const scaleX = screenWidth / 1920;
            const scaleY = screenHeight / 1080;


            return (
               <React.Fragment key={c.id}>
                  {!showSkull && (
                     <SniperImg
                        x={c.x * scaleX}
                        y={c.y * scaleY}
                        src={c.image}
                        alt="Sniper"
                        /* --- same pattern as FlyingBalloon --- */
                        initial={{ rotate: 0, y: 0, opacity: 1 }}
                        animate={
                           isDead
                              ? { rotate: 90, y: 30, opacity: 0.6 } // slump‑over
                              : { rotate: 0, y: 0, opacity: 1 }
                        }
                        transition={{
                           duration: isDead ? 1.4 : 0.2,
                           ease: isDead ? "easeIn" : "linear",
                        }}
                        style={{
                           filter: c.isSniper ? "drop-shadow(0 0 5px red)" : "none",
                        }}
                     />
                  )}

                  {/* active hitbox while sniper is alive */}
                  {c.isSniper && !c.isHit && snipersVisible && (
                     <motion.div
                        id={`sniper-hitbox-${c.id}`}
                        style={{
                           position: "absolute",
                           width: 9,
                           height: 9,
                           borderRadius: "50%",
                           top: c.y * scaleY,
                           left: c.x * scaleX - 6 + 8,
                           backgroundColor: "blue",
                           pointerEvents: "none",
                           zIndex: 10,
                        }}
                        
                     />
                     
                  )}

                  {/* skull appears after slump animation completes */}
                  {showSkull && (
                     <SkullWrapper x={c.x * scaleX} y={c.y * scaleY}>
                        <Skull>💀</Skull>
                        <Coffin>⚰️</Coffin>
                        <Wings
                           initial={{ y: 0, opacity: 0 }}
                           animate={{ y: -80, opacity: [0, 1, 0] }}
                           transition={{ duration: 4.2, ease: "easeInOut" }}

                        >
                           <span style={{ display: "inline-block", transform: "scaleX(-1)" }}>🪽</span>
                           <span style={{ marginLeft: "4px" }}>🪽</span>
                        </Wings>


                     </SkullWrapper>
                  )}


               </React.Fragment>
            );
         })}
      </div>
   );
};

export default EnemySnipers;

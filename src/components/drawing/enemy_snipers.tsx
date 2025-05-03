import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { Character } from "../Lobby";

interface Props {
   characters: Character[];
   snipersVisible: boolean;
   setCharacters: React.Dispatch<React.SetStateAction<Character[]>>;
}

const CharacterImg = styled.img<{ x: number; y: number }>`
  position: absolute;
  left: ${(props) => props.x - 2}px;
  top: ${(props) => props.y - 1}px;
  width: 18px;
  height: auto;
  pointer-events: none;
  z-index: 2;
`;

const EnemySnipers: React.FC<Props> = ({
   characters,
   snipersVisible,
   setCharacters,
}) => {
   const containerRef = useRef<HTMLDivElement>(null);

   // Update screenX/screenY every frame (similar to FlyingBalloon logic)
   useEffect(() => {
      let raf: number;

      const updateScreenCoords = () => {
         if (!containerRef.current) return;

         const rect = containerRef.current.getBoundingClientRect();

         setCharacters((prev) =>
            prev.map((c) => {
               if (!c.isSniper || c.isHit) return c;

               const screenX = c.x;
               const screenY = c.y;

               return {
                  ...c,
                  screenX,
                  screenY,
                  radius: 10,
               };
            }),
         );

         raf = requestAnimationFrame(updateScreenCoords);
      };

      raf = requestAnimationFrame(updateScreenCoords);
      return () => cancelAnimationFrame(raf);
   }, [setCharacters]);

   return (
      <div ref={containerRef}>
         {characters.map((c) => {
            if (!c.image || (!snipersVisible && c.isSniper)) return null;

            return (
               <React.Fragment key={c.id}>
                  <CharacterImg
                     x={c.x}
                     y={c.y}
                     src={c.image}
                     alt="Sniper"
                     style={{
                        filter: c.isSniper ? "drop-shadow(0 0 5px red)" : "none",
                     }}
                  />

                  {c.isSniper && !c.isHit && snipersVisible && (
                     <motion.div
                        id={`sniper-hitbox-${c.id}`}
                        style={{
                           position: "absolute",
                           width: 8,                    // smaller
                           height: 8,                   // smaller
                           borderRadius: "50%",
                           border: "None",
                           backgroundColor: "transparent", // make sure no color is shown
                           top: c.y - 6 + 5,             // move hitbox 3px down
                           left: c.x - 6 + 8,            // move hitbox 4px to the right
                           pointerEvents: "none",
                           zIndex: 10,
                        }}
                     />
                  )}

               </React.Fragment>
            );
         })}
      </div>
   );
};

export default EnemySnipers;

import { motion } from "framer-motion";
import { useEffect } from "react";

interface Props {
   id: number;
   startY: number;
   duration: number;
   size: number;
   onFinish: (id: number) => void;
   balloonRef: React.MutableRefObject<
      { id: number; x: number; y: number; size: number }[]
   >;
}

export const FlyingBalloon: React.FC<Props> = ({
   id,
   startY,
   duration,
   size,
   onFinish,
   balloonRef,
}) => {
   const handleComplete = () => {
      console.log(`🎈 Balloon ${id} animation complete.`);
      onFinish(id);
   };

   useEffect(() => {
      const interval = setInterval(() => {
         const el = document.getElementById(`balloon-${id}`);
         if (!el) {
            console.warn(`🚫 Balloon ${id} element not found`);
            return;
         }

         const rect = el.getBoundingClientRect();
         const x = rect.left + rect.width / 2;
         const y = rect.top + rect.height / 2;

         const index = balloonRef.current.findIndex((b) => b.id === id);
         if (index !== -1) {
            balloonRef.current[index].x = x;
            balloonRef.current[index].y = y;
         } else {
            console.warn(`❓ Balloon ${id} not found in balloonRef`);
         }
      }, 100);

      return () => {
         clearInterval(interval);
         console.log(`🧹 Cleaned interval for balloon ${id}`);
      };
   }, [id, balloonRef]);

   return (
      <motion.img
         id={`balloon-${id}`}
         src="/figures/balloon.png"
         alt={`balloon-${id}`}
         initial={{
            x: window.innerWidth + 150,
            y: startY,
            rotate: -10,
         }}
         animate={{
            x: -200,
            y: [startY, startY - 30, startY + 30, startY - 20, startY],
            rotate: [-10, 5, -10],
         }}
         transition={{
            duration,
            ease: "linear",
         }}
         onAnimationComplete={handleComplete}
         style={{
            position: "absolute",
            width: size,
            height: size,
            pointerEvents: "none",
            zIndex: 1,
         }}
      />
   );
};

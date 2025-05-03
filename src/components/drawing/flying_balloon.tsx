import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Props {
  id: number;
  startY: number;
  duration: number;
  size: number;
  onFinish: (id: number) => void;
  balloonRef: React.MutableRefObject<
    { id: number; x: number; y: number; size: number; isHit: boolean }[]
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
    onFinish(id);
  };

  const [isHit, setIsHit] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const el = document.getElementById(`balloon-hitbox-${id}`);
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      const index = balloonRef.current.findIndex((b) => b.id === id);
      if (index !== -1) {
        const balloon = balloonRef.current[index];
        balloon.x = x;
        balloon.y = y;
        balloon.size = size;

        if (balloon.isHit && !isHit) {
          setIsHit(true); // 🚨 trigger crash
        }
      } else {
        balloonRef.current.push({ id, x, y, size, isHit: false });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [id, size, balloonRef, isHit]);

  return (
    <>
      <motion.img
        id={`balloon-${id}`}
        src="/figures/balloon.png"
        alt={`balloon-${id}`}
        initial={{
          x: window.innerWidth + 150,
          y: startY,
          rotate: -10,
          opacity: 1,
        }}
        animate={
          isHit
            ? {
                x: -200, // keep gliding left
                y: window.innerHeight + 150, // fall to bottom
                rotate: 720,
                opacity: 1, // stay visible until the end
              }
            : {
                x: -200,
                y: [startY, startY - 30, startY + 30, startY - 20, startY],
                rotate: [-10, 5, -10],
                opacity: 1,
              }
        }
        transition={{
          duration: isHit ? 2.5 : duration,
          ease: isHit ? "easeIn" : "linear",
        }}
        onAnimationComplete={() => {
          if (isHit) onFinish(id); // cleanup when crash is done
        }}
        style={{
          position: "absolute",
          width: size,
          height: size,
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      <motion.div
        id={`balloon-hitbox-${id}`}
        initial={{
          x: window.innerWidth + 150,
          y: startY,
        }}
        animate={{
          x: -200,
          y: [startY, startY - 30, startY + 30, startY - 20, startY],
        }}
        transition={{
          duration,
          ease: "linear",
        }}
        style={{
          position: "absolute",
          width: size * 0.6,
          height: size * 0.6,
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 2,
          top: `${size * 0.2 - 10}px`,
          left: `${size * 0.2}px`,
          backgroundColor: "transparent", // make sure no color is shown
          border: "none", // remove blue border
        }}
      />

      {/* 🔵 Blue debug circle overlay (smaller visual hitbox) */}
      {/* <motion.div
            initial={{
               x: window.innerWidth + 150,
               y: startY,
            }}
            animate={{
               x: -200,
               y: [startY, startY - 30, startY + 30, startY - 20, startY],
            }}
            transition={{
               duration,
               ease: "linear",
            }}
            style={{
               position: "absolute",
               width: size * 0.6,
               height: size * 0.6,
               borderRadius: "50%",
               border: "2px solid rgba(0, 150, 255, 0.9)",
               pointerEvents: "none",
               zIndex: 2,
               top: `${(size * 0.2 - 10)}px`,
               left: `${(size * 0.2)}px`,
            }} */}

      {/* /> */}
    </>
  );
};

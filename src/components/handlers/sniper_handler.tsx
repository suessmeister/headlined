// hooks/useSniperHandlers.ts
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { Character } from "../City";

export function useSniperHandlers({
  sceneRef,
  cameraRef,
  setShots,
  setHits,
  setIsLastShotHit,
  setSniperScopePosition,
  setIsSniperScopeVisible,
  characterRef,
  isZoomedRef,
  zoomPosRef,
}: {
  sceneRef: React.MutableRefObject<THREE.Scene | null>;
  cameraRef: React.MutableRefObject<THREE.PerspectiveCamera | null>;
  setShots: React.Dispatch<React.SetStateAction<number>>;
  setHits: React.Dispatch<React.SetStateAction<number>>;
  setIsLastShotHit: React.Dispatch<React.SetStateAction<boolean>>;
  setSniperScopePosition: React.Dispatch<
    React.SetStateAction<{ x: number; y: number } | null>
  >;
  setIsSniperScopeVisible: React.Dispatch<React.SetStateAction<boolean>>;
  characterRef: React.MutableRefObject<Character[]>;
  isZoomedRef: React.MutableRefObject<boolean>;
  zoomPosRef: React.MutableRefObject<{ x: number; y: number }>;
}) {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!sceneRef.current || !cameraRef.current) return;

      const screenX = isZoomedRef.current
        ? zoomPosRef.current.x - 55 + 50
        : e.clientX;
      const screenY = isZoomedRef.current
        ? zoomPosRef.current.y - 36 + 50
        : e.clientY;

      setShots((prev) => prev + 1);

      const mouse = new THREE.Vector2(
        (screenX / window.innerWidth) * 2 - 1,
        -(screenY / window.innerHeight) * 2 + 1,
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);
      const dir = raycaster.ray.direction.clone().normalize();

      const pts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1)];
      const geom = new THREE.BufferGeometry();
      geom.setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({ color: 0xff4500 });
      const line = new THREE.Line(geom, mat);

      line.position.copy(cameraRef.current.position);
      line.quaternion.copy(cameraRef.current.quaternion);
      sceneRef.current.add(line);

      const speed = 10.0;
      const maxDist = 300;
      let travelled = 0;

      const fly = () => {
        travelled += speed;
        if (travelled < maxDist) {
          line.position.addScaledVector(dir, speed);
          requestAnimationFrame(fly);
        } else {
          const finalScreenPosition = new THREE.Vector3();
          finalScreenPosition.copy(line.position);
          const projected = finalScreenPosition.project(cameraRef.current!);

          const x = (projected.x * 0.5 + 0.5) * window.innerWidth;
          const y = -(projected.y * 0.5 - 0.5) * window.innerHeight;

          const hit = characterRef.current.some((character) => {
            return (
              x >= character.x - 15 &&
              x <= character.x + 15 &&
              y >= character.y - 20 &&
              y <= character.y + 20
            );
          });

          if (hit) {
            setHits((prev) => prev + 1);
            setIsLastShotHit(true);
          } else {
            setIsLastShotHit(false);
          }

          setSniperScopePosition({ x, y });
          setIsSniperScopeVisible(true);

          setTimeout(() => {
            setIsSniperScopeVisible(false);
          }, 1000);

          sceneRef.current!.remove(line);
          geom.dispose();
          mat.dispose();
        }
      };
      fly();
    };

    window.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, []);
}

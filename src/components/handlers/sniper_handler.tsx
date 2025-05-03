// hooks/useSniperHandlers.ts
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { Character } from "../City";
import { getSocket } from "../../app/utils/socket";

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
  setAmmo,
  ammo,
  isReloading,
  balloonRef,
  unlimitedAmmo,
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
  setAmmo: React.Dispatch<React.SetStateAction<number>>;
  ammo: number;
  isReloading: boolean;
  balloonRef: React.MutableRefObject<
    { id: number; x: number; y: number; size: number; isHit: boolean }[]
  >;
  unlimitedAmmo: boolean;
}) {
  const unlimitedAmmoRef = useRef(unlimitedAmmo);
  useEffect(() => {
    unlimitedAmmoRef.current = unlimitedAmmo;
  }, [unlimitedAmmo]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!sceneRef.current || !cameraRef.current) return;

      if (!unlimitedAmmoRef.current) {
        if (!isReloading && ammo > 0) {
          setAmmo((prev: number) => prev - 1);
        } else {
          return;
        }
      }

      let screenX: number;
      let screenY: number;

      if (isZoomedRef.current) {
        screenX = zoomPosRef.current.x - 5;
        screenY = zoomPosRef.current.y + 14;
      } else {
        const jitterX = (Math.random() - 0.5) * 100; // up to ±40px
        const jitterY = (Math.random() - 0.5) * 100;
        screenX = e.clientX + jitterX;
        screenY = e.clientY + jitterY;
      }

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

          const hitCharacter = characterRef.current.find((character) => {
            return (
              x >= character.x - 15 &&
              x <= character.x + 15 &&
              y >= character.y - 20 &&
              y <= character.y + 20
            );
          });

          const hitBalloon = balloonRef.current.find((b) => {
            const el = document.getElementById(`balloon-hitbox-${b.id}`);
            if (!el) return false;

            const rect = el.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const radius = rect.width / 2;

            const dx = x - centerX;
            const dy = y - centerY;

            return dx * dx + dy * dy <= radius * radius;
          });

          if (hitBalloon) {
            setHits((prev) => prev + 1);
            setIsLastShotHit(true);

            const index = balloonRef.current.findIndex(
              (b) => b.id === hitBalloon.id,
            );
            if (index !== -1) {
              balloonRef.current[index].isHit = true; // 💥 crash it!
            }

            const socket = getSocket();
            socket.emit("shot", {
              characterId: hitCharacter ? hitCharacter.id : null,
              by: socket.id,
            });
          }

          if (hitCharacter || hitBalloon) {
            setHits((prev) => prev + 1);
            setIsLastShotHit(true);
            const socket = getSocket();
            socket.emit("shot", {
              characterId: hitCharacter ? hitCharacter.id : null,
              by: socket.id,
            });
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
  }, [
    ammo,
    isReloading,
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
    setAmmo,
  ]);
}

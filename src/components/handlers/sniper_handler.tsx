import { useEffect, useRef } from "react";
import * as THREE from "three";
import { Character } from "../City";
import { getSocket } from "../../app/utils/socket";

interface SniperHandlersParams {
  sceneRef: React.MutableRefObject<THREE.Scene | null>;
  cameraRef: React.MutableRefObject<THREE.PerspectiveCamera | null>;
  setShots: React.Dispatch<React.SetStateAction<number>>;
  setHits: React.Dispatch<React.SetStateAction<number>>;
  setIsLastShotHit: React.Dispatch<React.SetStateAction<boolean>>;
  setSniperScopePosition: React.Dispatch<React.SetStateAction<{ x: number; y: number } | null>>;
  setIsSniperScopeVisible: React.Dispatch<React.SetStateAction<boolean>>;
  characterRef: React.MutableRefObject<Character[]>;
  setCharacters: React.Dispatch<React.SetStateAction<Character[]>>;
  isZoomedRef: React.MutableRefObject<boolean>;
  zoomPosRef: React.MutableRefObject<{ x: number; y: number }>;
  setAmmo: React.Dispatch<React.SetStateAction<number>>;
  ammo: number;
  isReloading: boolean;
  balloonRef: React.MutableRefObject<
    { id: number; x: number; y: number; size: number; isHit: boolean }[]
  >;
  unlimitedAmmo: boolean;
}

export function useSniperHandlers({
  sceneRef,
  cameraRef,
  setShots,
  setHits,
  setIsLastShotHit,
  setSniperScopePosition,
  setIsSniperScopeVisible,
  characterRef,
  setCharacters,
  isZoomedRef,
  zoomPosRef,
  setAmmo,
  ammo,
  isReloading,
  balloonRef,
  unlimitedAmmo,
}: SniperHandlersParams) {
  const unlimitedAmmoRef = useRef(unlimitedAmmo);
  useEffect(() => {
    unlimitedAmmoRef.current = unlimitedAmmo;
  }, [unlimitedAmmo]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!sceneRef.current || !cameraRef.current) return;

      if (!unlimitedAmmoRef.current && (!isReloading && ammo > 0)) {
        setAmmo((prev) => prev - 1);
      } else if (!unlimitedAmmoRef.current) {
        return;
      }

      let screenX: number;
      let screenY: number;

      if (isZoomedRef.current) {
        screenX = zoomPosRef.current.x - 5;
        screenY = zoomPosRef.current.y + 14;
      } else {
        screenX = e.clientX + (Math.random() - 0.5) * 100;
        screenY = e.clientY + (Math.random() - 0.5) * 100;
      }

      setShots((prev) => prev + 1);

      const mouse = new THREE.Vector2(
        (screenX / window.innerWidth) * 2 - 1,
        -(screenY / window.innerHeight) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);
      const dir = raycaster.ray.direction.clone().normalize();

      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1)]),
        new THREE.LineBasicMaterial({ color: 0xff4500 })
      );
      line.position.copy(cameraRef.current.position);
      line.quaternion.copy(cameraRef.current.quaternion);
      sceneRef.current.add(line);

      const speed = 10;
      const maxDist = 300;
      let travelled = 0;

      const fly = () => {
        travelled += speed;
        if (travelled < maxDist) {
          line.position.addScaledVector(dir, speed);
          requestAnimationFrame(fly);
        } else {
          const finalPosition = new THREE.Vector3().copy(line.position).project(cameraRef.current!);
          const x = (finalPosition.x * 0.5 + 0.5) * window.innerWidth;
          const y = -(finalPosition.y * 0.5 - 0.5) * window.innerHeight;

          const hitCharacter = characterRef.current.find((c) => {
            if (!c.isSniper) return false;
            const el = document.getElementById(`sniper-hitbox-${c.id}`);
            if (!el) return false;

            const rect = el.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const radius = rect.width / 2;

            const adjustedX = x - 8.4;
            const adjustedY = y + 22.7;

            return (
              adjustedX >= centerX - radius &&
              adjustedX <= centerX + radius &&
              adjustedY >= centerY - radius &&
              adjustedY <= centerY + radius
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
            const index = balloonRef.current.findIndex((b) => b.id === hitBalloon.id);
            if (index !== -1) balloonRef.current[index].isHit = true;
          }

          if (hitCharacter) {
            setCharacters((prev) =>
              prev.map((c) => (c.id === hitCharacter.id ? { ...c, isHit: true } : c))
            );
          }

          if (hitCharacter || hitBalloon) {
            setHits((prev) => prev + 1);
            setIsLastShotHit(true);
            getSocket().emit("shot", {
              characterId: hitCharacter?.id ?? null,
              by: getSocket().id,
            });
          } else {
            setIsLastShotHit(false);
          }

          setSniperScopePosition({ x, y });
          setIsSniperScopeVisible(true);
          setTimeout(() => setIsSniperScopeVisible(false), 1000);

          sceneRef.current!.remove(line);
          line.geometry.dispose();
          (line.material as THREE.Material).dispose();
        }
      };

      fly();
    };

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
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
    setCharacters,
    isZoomedRef,
    zoomPosRef,
    setAmmo,
  ]);
}

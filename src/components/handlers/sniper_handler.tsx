import { useEffect, useRef } from "react";
import * as THREE from "three";
import { Character } from "../types/Character";
import { getSocket } from "../../app/utils/socket";

interface SniperHandlersParams {
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

      /* ammo handling … */
      if (!unlimitedAmmoRef.current) {
        if (!isReloading && ammo > 0) {
          setAmmo((prev: number) => prev - 1);
        } else {
          return;
        }
      }

      /* compute click (or jitter) coords */
      const { x: rawX, y: rawY } = isZoomedRef.current
        ? { x: zoomPosRef.current.x - 5, y: zoomPosRef.current.y + 14 }
        : {
            x: e.clientX + (Math.random() - 0.5) * 100,
            y: e.clientY + (Math.random() - 0.5) * 100,
          };

      setShots((p) => p + 1);

      /* ───── snapshot sniper hit, using offsets ───── */
      const sniperHit = characterRef.current.find((c) => {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const scaleX = screenWidth / 1920;
        const scaleY = screenHeight / 1080;

        if (!c.isSniper) return false;
        const el = document.getElementById(`sniper-hitbox-${c.id}`);
        if (!el) return false;
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const rad = r.width / 2;
        const adjX = rawX - 8.4 * scaleX; // ← apply offsets
        const adjY = rawY + 22.7 * scaleY;
        const dx = adjX - cx;
        const dy = adjY - cy;
        return dx * dx + dy * dy <= rad * rad;
      }) as Character | undefined;

      const mouse = new THREE.Vector2(
        (rawX / window.innerWidth) * 2 - 1,
        -(rawY / window.innerHeight) * 2 + 1,
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);
      const dir = raycaster.ray.direction.clone().normalize();

      const tracer = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0, 0, -1),
        ]),
        new THREE.LineBasicMaterial({ color: 0x39ff14 }),
      );
      tracer.position.copy(cameraRef.current.position);
      tracer.quaternion.copy(cameraRef.current.quaternion);
      sceneRef.current.add(tracer);

      const speed = 10;
      const maxDist = 300;
      let travelled = 0;

      const fly = () => {
        travelled += speed;
        if (travelled < maxDist) {
          tracer.position.addScaledVector(dir, speed);
          requestAnimationFrame(fly);
        } else {
          /* project tip for scope flash only */
          const proj = new THREE.Vector3()
            .copy(tracer.position)
            .project(cameraRef.current!);
          const flashX = (proj.x * 0.5 + 0.5) * window.innerWidth;
          const flashY = -(proj.y * 0.5 - 0.5) * window.innerHeight;

          /* balloons are tested live (they were fine) */
          const hitBalloon = balloonRef.current.find((b) => {
            const el = document.getElementById(`balloon-hitbox-${b.id}`);
            if (!el) return false;
            const r = el.getBoundingClientRect();
            const cx = r.left + r.width / 2;
            const cy = r.top + r.height / 2;
            const rad = r.width / 2;
            const dx = flashX - cx;
            const dy = flashY - cy;
            return dx * dx + dy * dy <= rad * rad;
          });

          /* apply results */
          if (sniperHit) {
            setCharacters((prev) =>
              prev.map((c) =>
                c.id === sniperHit.id ? { ...c, isHit: true } : c,
              ),
            );
          }
          if (hitBalloon) {
            const idx = balloonRef.current.findIndex(
              (b) => b.id === hitBalloon.id,
            );
            if (idx !== -1) balloonRef.current[idx].isHit = true;
          }

          if (sniperHit || hitBalloon) {
            setHits((p) => p + 1);
            setIsLastShotHit(true);
            getSocket().emit("shot", {
              characterId: sniperHit?.id ?? null,
              by: getSocket().id,
            });
          } else {
            setIsLastShotHit(false);
          }

          setSniperScopePosition({ x: flashX, y: flashY });
          setIsSniperScopeVisible(true);
          setTimeout(() => setIsSniperScopeVisible(false), 1000);

          /* cleanup tracer */
          sceneRef.current!.remove(tracer);
          tracer.geometry.dispose();
          (tracer.material as THREE.Material).dispose();
        }
      };

      fly();
    };

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [
    ammo,
    isReloading,
    setShots,
    setHits,
    setIsLastShotHit,
    setSniperScopePosition,
    setIsSniperScopeVisible,
    setCharacters,
    isZoomedRef,
    zoomPosRef,
    setAmmo,
  ]);
}

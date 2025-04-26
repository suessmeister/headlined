import { useEffect } from "react";

export function useZoomHandlers({
  setIsZoomed,
  setZoomPosition,
  canZoom,
}: {
  setIsZoomed: React.Dispatch<React.SetStateAction<boolean>>;
  setZoomPosition: React.Dispatch<
    React.SetStateAction<{ x: number; y: number }>
  >;
  canZoom: boolean;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!canZoom) return;
      if (e.ctrlKey) {
        setIsZoomed(true);
        document.body.style.cursor = "none";
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.ctrlKey) {
        setIsZoomed(false);
        document.body.style.cursor = "default";
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!canZoom) return;
      setZoomPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.style.cursor = "default";
    };
  }, [setIsZoomed, setZoomPosition, canZoom]);
}

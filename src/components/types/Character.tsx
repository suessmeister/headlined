export interface Character {
   id: number;
   x: number;
   y: number;
   image: string;
   isSniper?: boolean;
   phase?: "warmup" | "dark" | "aggressive";
   nextPhase?: number;
   laserCooldown?: number;
   isHit?: boolean;
}

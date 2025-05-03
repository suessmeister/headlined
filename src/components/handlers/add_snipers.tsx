import { Character } from "../types/Character";

export function addSnipers(
   chars: Character[],
   maxNew: number = 10,
   baseDelay: number = 1500,           // base delay before first phase
   stagger: number = 500               // 0.5s between each spawn
): Character[] {
   const now = Date.now();
   let added = 0;

   return chars.map((c) => {
      const isOnScreen =
         c.x >= 0 && c.x <= window.innerWidth &&
         c.y >= 0 && c.y <= window.innerHeight;

      if (
         !c.isSniper &&
         !c.isHit &&
         isOnScreen &&
         added < maxNew
      ) {
         const delay = baseDelay + added * stagger;
         added += 1;

         return {
            ...c,
            isSniper: true,
            phase: "warmup",
            image: "/figures/sniper.png",
            nextPhase: now + delay,
            laserCooldown: undefined,
         };
      }

      return c;
   });
}

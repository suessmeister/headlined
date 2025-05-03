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
      const margin = 50;
      const isOnScreen =
         c.x >= margin &&
         c.x <= window.innerWidth - margin &&
         c.y >= margin &&
         c.y <= window.innerHeight - margin;

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
            image: "/figures/evil_sniper.png",
            nextPhase: now + delay,
            laserCooldown: undefined,
         };
      }

      return c;
   });
}

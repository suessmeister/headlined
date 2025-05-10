// components/Newspaper.tsx
import React from "react";
import { newspaperHtml } from "../../app/utils/NewspaperHtml";

export default function Newspaper() {
   const today = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric"
   });

   const walletA = "F9S6kS3KcHvNLYwXApsyqRdnS8EJLaxuyK34FMZ425Xd";
   const walletB = "8rrF7VycfSHR48iQ7HXTRwHaNJNf2p2MkA5fHf5KDSJ";
   const a_kills = 40;
   const b_kills = 25;   


   const sniperHeadlines: string[] = [
      "The Streets Ran Red: One Sniper, Dozens Dead",
      "He Came. He Scoped. He Slaughtered.",
      "Massacre in the Fog: Only One Walked Away",
      "Silent But Deadly: One Sniper Wiped the Map Clean",
      "Stacked Bodies, Empty Streets: One Gunman’s Reign of Terror",
      "Enemies Lined Up and Dropped — A Killing Symphony in 4/4 Time",
      "The Kill Feed Couldn't Keep Up: One Sniper’s Brutal Ascension",
      "No Mercy, No Misses: One Warrior’s Bullet Ballet",
      "Precision and Bloodshed: 2 Snipers Enter, One Exits Over a Mountain of Corpses",
      "The Last Man Didn't Hide — He Hunted"
   ];



   return (
      <> 
         <div
            dangerouslySetInnerHTML={{
               __html: newspaperHtml(
                  sniperHeadlines[Math.floor(Math.random() * sniperHeadlines.length)],
                  today,
                  walletA,
                  walletB,
                  a_kills,
                  b_kills
               )
            }}
            style={{
               position: "absolute",       // float above
               top: 0,
               left: 0,
               right: 0,
               zIndex: 9999,               // highest priority
               background: "#f4f1ec",      // make sure it's opaque
               minHeight: "100vh",         // fully cover page
               padding: "2rem"
            }}
         />


</>

   );
}


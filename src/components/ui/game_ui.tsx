// components/GameUIComponents.tsx

import React from "react";

export const InfiniteAmmoToggle = ({
   unlimitedAmmo,
   setUnlimitedAmmo,
}: {
   unlimitedAmmo: boolean;
   setUnlimitedAmmo: React.Dispatch<React.SetStateAction<boolean>>;
}) => (
   <div
      style={{
         position: "fixed",
         top: 70,
         left: 20,
         zIndex: 9999,
         display: "flex",
         alignItems: "center",
         gap: "6px",
         font: "bold 13px Quantico",
         color: "white",
         backgroundColor: "black",
         padding: "6px 10px",
         borderRadius: "6px",
         border: "1px solid rgba(255,255,255,0.2)",
      }}
   >
      <input
         type="checkbox"
         id="infinite-ammo"
         checked={unlimitedAmmo}
         onChange={() => setUnlimitedAmmo((p) => !p)}
         style={{ cursor: "pointer" }}
      />
      <label htmlFor="infinite-ammo" style={{ cursor: "pointer" }}>
         ♾️ Ammo
      </label>
   </div>
);

// export const GunDisplay = ({
//   activeGun,
// }: {
//   activeGun: { name: string } | null;
// }) => (
//   <div
//     style={{
//       position: "fixed",
//       top: 60,
//       right: 20,
//       backgroundColor: "rgba(0, 0, 0, 0.7)",
//       padding: "5px 15px",
//       borderRadius: "8px",
//       color: "white",
//       fontFamily: "monospace",
//       fontSize: "16px",
//       zIndex: 9999,
//       display: "flex",
//       gap: "20px",
//     }}
//   >
//     {activeGun && <div>Now Using: {activeGun.name}</div>}
//   </div>
// );

export const IntroMessage = () => (
   <div
      style={{
         position: "fixed",
         top: "40%",
         left: "50%",
         transform: "translate(-50%, -50%)",
         padding: "20px 40px",
         backgroundColor: "rgba(0,0,0,0.85)",
         color: "red",
         fontSize: "28px",
         fontFamily: "monospace",
         textAlign: "center",
         borderRadius: "12px",
         zIndex: 9999,
         boxShadow: "0 0 20px red",
      }}
   >
      Enemy Snipers have located you!
   </div>
);

export const FlashMessage = ({ flashMessage }: { flashMessage: string }) => (
   <div
      style={{
         position: "fixed",
         top: 0,
         width: "100%",
         textAlign: "center",
         padding: "10px",
         backgroundColor: "rgba(255, 0, 0, 0.8)",
         color: "white",
         fontSize: "18px",
         fontFamily: "monospace",
         zIndex: 9999,
         animation: "fadeInOut 2s ease-in-out",
      }}
   >
      {flashMessage}
   </div>
);

interface AmmoBarProps {
   ammo: number;
   maxAmmo: number;
   position: { x: number; y: number };
   isZoomed: boolean;
   isReloading: boolean;
}

export const AmmoBar: React.FC<AmmoBarProps> = ({ ammo, maxAmmo, position, isZoomed, isReloading }) => {
   if (isReloading || !isZoomed) return null;

   return (
      <div
         style={{
            position: "fixed",
            top: position.y,
            left: position.x + 30,
            transform: "translate(-50%, -50%)",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            padding: "2px",
            borderRadius: "2px",
            color: "white",
            fontFamily: "monospace",
            textShadow: "0 0 4px black",
            zIndex: 1000,
            pointerEvents: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "50px",
            width: "15px",
         }}
      >
         {Array.from({ length: maxAmmo }).map((_, index) => (
            <div
               key={index}
               style={{
                  flex: 1,
                  width: "70%",
                  backgroundColor: index < ammo ? "white" : "rgba(255, 255, 255, 0.2)",
                  borderRadius: "1px",
                  margin: "1px 0",
                  transition: "background-color 0.3s",
               }}
            />
         ))}
      </div>
   );
};


interface ReloadTimerProps {
   reloadSecondsLeft: number;
   isZoomed: boolean;
   zoomPosition: { x: number; y: number };
}

export const ReloadTimer: React.FC<ReloadTimerProps> = ({
   reloadSecondsLeft,
   isZoomed,
   zoomPosition,
}) => {
   if (reloadSecondsLeft == null) return null;

   const baseStyle: React.CSSProperties = {
      position: "fixed",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      borderRadius: "12px",
      zIndex: 1000,
      pointerEvents: "none",
   };

   const textStyle: React.CSSProperties = {
      color: "gold",
      fontFamily: "monospace",
      textShadow: "0 0 6px black",
   };

   return isZoomed ? (
      <div
         style={{
            ...baseStyle,
            top: `${zoomPosition.y}px`,
            left: `${zoomPosition.x}px`,
            transform: "translate(-50%, -50%)",
            padding: "12px 20px",
         }}
      >
         <div style={{ ...textStyle, fontSize: "28px", marginBottom: "8px" }}>
            Reloading...
         </div>
         <div style={{ ...textStyle, fontSize: "36px", textShadow: "0 0 8px black" }}>
            {reloadSecondsLeft.toFixed(1)}
         </div>
      </div>
   ) : (
      <div
         style={{
            ...baseStyle,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            padding: "16px 24px",
         }}
      >
         <div style={{ ...textStyle, fontSize: "32px", marginBottom: "8px" }}>
            Reloading...
         </div>
         <div style={{ ...textStyle, fontSize: "42px", textShadow: "0 0 8px black" }}>
            {reloadSecondsLeft.toFixed(1)}
         </div>
      </div>
   );
};

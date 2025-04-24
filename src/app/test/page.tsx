// // src/app/test/page.tsx
// "use client";

// import { useEffect } from "react";
// import io from "socket.io-client";

// export default function TestPage() {
//    useEffect(() => {
//       const socket = io({
//          path: "/api/socket",
//       });

//       socket.on("connect", () => {
//          console.log("✅ Connected to socket.io server:", socket.id);
//       });

//       socket.on("start", (data: any) => {
//          console.log("🎯 Match started:", data);
//       });

//       // Simulate firing a test shot
//       setTimeout(() => {
//          socket.emit("shot", { x: 123, y: 456 });
//       }, 2000);

//       socket.on("shot", (msg: any) => {
//          console.log("💥 Received shot:", msg);
//       });

//       return () => {
//          socket.disconnect();
//       };
//    }, []);

//    return <div style={{ padding: 40 }}>Socket test page — check the console.</div>;
// }

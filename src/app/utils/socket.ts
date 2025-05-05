// utils/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
const regular_server = "https://headlinedbackend-production.up.railway.app;"
export function getSocket(): Socket {
   if (!socket) {
      if (typeof window !== "undefined") {
         socket = io("http://localhost:4000");
      } else {
         console.warn("Attempted to connect socket on server.");
      }
   }
   return socket!;
}

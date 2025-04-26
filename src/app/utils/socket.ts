// utils/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
   if (!socket) {
      if (typeof window !== "undefined") {
         socket = io("https://headlinedbackend-production.up.railway.app/");
      } else {
         console.warn("Attempted to connect socket on server.");
      }
   }
   return socket!;
}

// utils/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

// Replace with your actual Railway backend URL!
const SOCKET_SERVER_URL = "https://your-railway-server.up.railway.app";
const test_url = "http://localhost:4000";

export function getSocket(): Socket {
   if (!socket) {
      if (typeof window !== "undefined") {
         socket = io(SOCKET_SERVER_URL);
      } else {
         console.warn("Attempted to connect socket on server.");
      }
   }
   return socket!;
}

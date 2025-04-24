// server/api/socket.ts
import { Server } from "socket.io";
import type { NextApiRequest } from "next";
import { Socket } from "socket.io-client";

const SocketHandler = (req: NextApiRequest, res: any) => {
   if (res.socket.server.io) {
      res.end();
      return;
   }

   const io = new Server(res.socket.server, {
      path: "/api/socket",
   });
   

   res.socket.server.io = io;

   const queue: any[] = [];

   io.on("connection", (socket) => {
      console.log("Socket connected:", socket.id);
      queue.push(socket);

      if (queue.length >= 2) {
         const [p1, p2] = [queue.shift(), queue.shift()];
         const seed = Math.random().toString().slice(2);
         const matchId = `match-${seed}`;

         const players = [p1, p2];
         for (let i = 0; i < 2; i++) {
            players[i].emit("start", { matchId, seed, playerIndex: i });
            players[i].on("shot", (msg: any) => {
               players[1 - i].emit("shot", msg);
            });
         }

         console.log(`Match started: ${matchId}`);
      }
   });

   res.end();
};

export default SocketHandler;

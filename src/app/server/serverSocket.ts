// import { Server } from "socket.io";
// import seedrandom from "seedrandom";
// import { v4 as uuid } from "uuid";

// const queue: any[] = [];

// export function setupSocket(server: any) {
//    const io = new Server(server, {
//       cors: {
//          origin: "*",
//       },
//    });

//    io.on("connection", (socket) => {
//       console.log("Player connected:", socket.id);
//       queue.push(socket);

//       if (queue.length >= 2) {
//          const [p1, p2] = [queue.shift(), queue.shift()];
//          const seed = seedrandom().toString().slice(2);
//          const matchId = uuid();

//          const players = [p1, p2];

//          players.forEach((sock, i) => {
//             sock.emit("start", {
//                matchId,
//                seed,
//                playerIndex: i,
//             });

//             sock.on("shot", (data: any) => {
//                players[1 - i].emit("shot", {
//                   shooter: i,
//                   ...data,
//                });
//             });
//          });

//          console.log(`Match ${matchId} started with seed ${seed}`);
//       }
//    });
// }

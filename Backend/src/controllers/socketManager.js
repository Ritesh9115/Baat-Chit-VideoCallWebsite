// import { Server, Socket } from "socket.io";

// let connections = {};
// let message = {};
// let timeonline = {};

// export const connectToSocket = (server) => {
//     const io = new Server(server);

//     io.on("connection", (socket) => {
//         socket.on("join-call", (path) => {
//             if (connections[path] == undefined) {
//                 connections[path] = [];
//             }
//             connections[path].push(socket.id);
//             timeonline[socket.id] = new Date();

//             for (let a = 0; a < connections[path].length; a++) {
//                 io.to(connections[path][a]).emit("user-joined", socket.id, connections[path]);
//             }

//             if (message[path] != undefined) {
//                 for (let a = 0; a < message[path].length; ++a) {
//                     io.to(socket.id).emit("chat-message", message[path][a]['data'], message[path][a]['sender'], message[path][a]['socket-id-sender'])
//                 }
//             }
//         })

//         socket.on("signal", (toId, message) => {
//             io.to(toId).emit("signal", socket.id, message);
//         })


//         socket.on("chat-message", (data, sender) => {

//             // const [matchingRoom , found] = Object.entries(connections)
//             // .reduce(([room, isFound], [roomKey, roomValue])=>{
//             //     if(!isFound && roomValue.includes(socket.id)){
//             //         return [roomKey, true];
//             //     }
//             //     return [room , isFound];
//             // },["", false]);
//             let matchingRoom = "";
//             let found = false;

//             for (const roomKey in connections) {
//                 if (connections[roomKey].includes(socket.id)) {
//                     matchingRoom = roomKey;
//                     found = true;
//                     break;
//                 }
//             }

//             if (found == true) {
//                 if (message[matchingRoom] == undefined) {
//                     message[matchingRoom] = [];
//                 }
//                 message[matchingRoom].push({ 'sender': sender, 'data': data, 'socket-id-sender': socket.id });
//                 console.log("message", ":", sender, data);

//                 connections[matchingRoom].forEach(element => {
//                     io.to(element).emit("chat-message", data, sender, socket.id);
//                 });

//             }

//         })


//         socket.on("disconnect", () => {


//         })



//     })

//     return io;
// }


import { Server, Socket } from "socket.io";

let connections = {};
let message = {};
let timeonline = {};

export const connectToSocket = (server) => {
    const io = new Server(server,{
        cors:{
            origin:"*",
            methods:["GET","POST"],
            allowedHeaders: ["*"],
            credentials: true
        }
    });

    io.on("connection", (socket) => {

        console.log("Something Connected");

        socket.on("join-call", (path) => {
            if (connections[path] == undefined) {
                connections[path] = [];
            }

            connections[path].push(socket.id);
            timeonline[socket.id] = new Date();

            for (let a = 0; a < connections[path].length; a++) {
                io.to(connections[path][a]).emit(
                    "user-joined",
                    socket.id,
                    connections[path]
                );
            }

            if (message[path] != undefined) {
                for (let a = 0; a < message[path].length; ++a) {
                    io.to(socket.id).emit(
                        "chat-message",
                        message[path][a]["data"],
                        message[path][a]["sender"],
                        message[path][a]["socket-id-sender"]
                    );
                }
            }
        });

        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        });

        socket.on("chat-message", (data, sender) => {
            let matchingRoom = "";
            let found = false;

            for (const roomKey in connections) {
                if (connections[roomKey].includes(socket.id)) {
                    matchingRoom = roomKey;
                    found = true;
                    break;
                }
            }

            if (found){
                if (message[matchingRoom] == undefined) {
                    message[matchingRoom] = [];
                }

                message[matchingRoom].push({
                    sender: sender,
                    data: data,
                    "socket-id-sender": socket.id,
                });

                console.log("message", ":", sender, data);

                connections[matchingRoom].forEach((element) => {
                    io.to(element).emit("chat-message", data, sender, socket.id);
                });
            }
        });

        socket.on("disconnect", () => {
            let roomOfUser = "";
            let found = false;
            // this is the same logic used above
            for (const roomKey in connections) {
                if (connections[roomKey].includes(socket.id)) {
                    roomOfUser = roomKey;
                    found = true;
                    break;
                }
            }
            if (!found) return;

            // connections[roomOfUser].forEach(userSocketId => {
            //     io.to(userSocketId).emit("user-left", socket.id);
            // });
            for (let a = 0; a < connections[roomOfUser].length; a++) {
                io.to(connections[roomOfUser][a]).emit(
                    "user-left",
                    socket.id
                );
            }

            connections[roomOfUser] = connections[roomOfUser].filter(id => id !== socket.id);

            if (connections[roomOfUser].length === 0) {
                delete connections[roomOfUser];
            }

            const diffTime = Math.abs(timeonline[socket.id] - new Date());
            console.log("User was online for", diffTime, "ms");

        });
    });

    return io;
};
import { io, Socket } from 'socket.io-client';

const socket = io("http://localhost:3001")

socket.on("connect", () => {
    // console.log("connected")
    socket.emit("ping", "message from client", (response : any) => {
        // console.log(response)
    })
})
 
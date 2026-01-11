// const videoGrid = document.getElementById("video-grid");
// const myVideo = document.createElement("video");
// const messages = document.querySelector(".messages");
// myVideo.muted = true;
// const peer = new Peer(undefined, {
//     host: "home",
//     port: 8000,
//     path: "/peerjs",
//     secure: true
// });
// socket.on("user-connected", (userId) => {
//     console.log("user-connected")
//     connectToNewUser(userId, stream);
// });

// let myVideoStream;
// navigator.mediaDevices
//     .getUserMedia({
//         audio: true,
//         video: true,
//     })
//     .then((stream) => {
//         console.log(stream)
//         myVideoStream = stream;
//         addVideoStream(myVideo, stream);
//         peer.on("call", (call) => {
//             console.log('someone call me');
//             call.answer(stream);
//             const video = document.createElement("video");
//             call.on("stream", (userVideoStream) => {
//                 addVideoStream(video, userVideoStream);
//             });
//             messages.appendChild(video)
//         });

//     });

// const addVideoStream = (video, stream) => {
//     video.srcObject = stream;
//     video.addEventListener("loadedmetadata", () => {
//         video.play();
//         videoGrid.append(video);
//     });
// };


// const connectToNewUser = (userId, stream) => {
//     console.log('I call someone' + userId);
//     const call = peer.call(userId, stream);
//     const video = document.createElement("video");
//     call.on("stream", (userVideoStream) => {
//         addVideoStream(video, userVideoStream);
//         console.log(`connectToNewUser ${userId}`)
//     });
// };

// peer.on("open", (id) => {
//     console.log('my id is' + id);
//     socket.emit("join-room", roomId, id, userName);
// });

// socket.on("createMessage", (message, userName) => {
//     messages.innerHTML =
//         messages.innerHTML +
//         `<div class="message">
//         <b><i class="far fa-user-circle"></i> <span> ${userName === user ? "me" : userName
//         }</span> </b>
//         <span>${message}</span>
//     </div>`;
// });

const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
// const messages = document.querySelector(".messages");
myVideo.muted = true;


let myVideoStream;

navigator.mediaDevices.getUserMedia({ audio: true, video: true })
    .then(stream => {
        myVideoStream = stream;
        addVideoStream(myVideo, stream);

        // PeerJS: отвечаем на вызовы
        const peer = new Peer(undefined, {
            host: "home",
            port: 8000,
            path: "/peerjs",
            secure: true,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'turn:your-turn-server.com:3478', username: 'user', credential: 'pass' }
                ]
            }
        });

        peer.on("call", call => {
            console.log("incoming call");
            call.answer(stream);
            const video = document.createElement("video");
            call.on("stream", userVideoStream => addVideoStream(video, userVideoStream));
        });

        peer.on("open", id => {
            console.log("my peer id:", id);
            socket.emit("join-room", roomId, id, userName);
        });

        // когда приходит событие о новом пользователе, подключаемся к нему
        socket.on("user-connected", userId => {
            console.log("user-connected:", userId);
            connectToNewUser(userId, stream, peer);
        });
    });

const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
        video.play();
        videoGrid.append(video);
    });
};

const connectToNewUser = (userId, stream, peer) => {
    console.log("calling user:", userId);
    const call = peer.call(userId, stream);
    const video = document.createElement("video");
    call.on("stream", userVideoStream => addVideoStream(video, userVideoStream));
};

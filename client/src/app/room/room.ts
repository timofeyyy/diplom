import { AfterViewInit, ApplicationConfig, Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Peer } from 'peerjs';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { NgClass, NgIf } from '@angular/common';
import { AppConfigService } from '../../service/app-config.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-room',
  imports: [NgClass, HttpClientModule],
  templateUrl: './room.html',
  providers: [AppConfigService],
  styleUrl: './room.css',
  encapsulation: ViewEncapsulation.ShadowDom
})
export class Room implements AfterViewInit {

  myVideoStream: any
  socket: Socket<any, any> | undefined
  roomId: string | undefined
  userName: string | undefined
  activeUsers: Map<string, any> = new Map()

  @ViewChild('otherFrames') otherFrames!: ElementRef;
  @ViewChild('currentFrame') currentFrame!: ElementRef;

  constructor(
    private sanitizer: DomSanitizer,
    private router: Router,
    private route: ActivatedRoute,
    private appConfig: AppConfigService
  ) { }

  config: any
  ngAfterViewInit(): void {
    this.appConfig.getConfig().subscribe((config: any) => {
      console.log(config)
      this.config = config

      const query: Map<string, string> = new Map(Object.entries((this.route.snapshot.queryParamMap as any).params))
      this.roomId = query.get("roomId")
      // this.userName = query.get("userName")
      this.userName = crypto.randomUUID()
      this.socket = io(`https://${config.host}:${config.port}`, {
        secure: true,
        transports: ["websocket"],
      });
      this.onClientStreamLoaded()
    })
  }


  onClientStreamLoaded(): void {
    navigator.mediaDevices.getUserMedia({
      audio: true,
      video: {
        // cursor: 'always', 
        displaySurface: 'monitor',
      }
    })
      // https://actinochemical-unfendered-mickey.ngrok-free.dev
      .then(stream => {
        this.myVideoStream = stream;
        const peer = new Peer(undefined as unknown as string, {
          host: this.config.host,
          port: this.config.port,
          path: "/peerjs/peerjs1",
          secure: true,
          config: {
            iceServers: this.config.iceServers
          }
        });
        peer.on("call", call => {

          // console.log("incoming call");
          call.answer(stream);

          //добавить фантом, лодер
          console.log(`addVideoStream call`)
          call.on("stream", userVideoStream => this.addVideoStream(userVideoStream, call.peer));
        });

        peer.on("open", id => {
          // console.log("my peer id:", id);
          this.socket!.emit("join-room", this.roomId, id, this.userName);
          console.log(`addVideoStream open`)
          this.addVideoStream(stream, id);
        });

        this.socket!.on("user-connected", (userId: any) => {
          console.log("user-connected:", userId);
          setTimeout(() => {
            this.connectToNewUser(userId, stream, peer);
          }, 2000)
        });
        this.socket!.on("user-disconnected", (userId: any) => {
          console.log(`close ${userId}`)
          this.activeUsers.delete(userId);
          this.removeVideoStream(userId)
        });
      });

  }


  addVideoStream(stream: any, userId: string): void {
    const div = document.createElement("div")
    div.setAttribute("class", "frame")
    const video = document.createElement("video");
    const p = document.createElement("p");
    video.muted = true;
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
      console.log(`loading other user stream..`)
      this.socket!.emit('get-user-data', this.roomId, userId, (userName: any) => {
        if (!this.activeUsers.get(userId)) {
          console.log(userName, userId)
          p.innerText = userName

          div.setAttribute("id", userId)
          video.setAttribute("class", this.userName == userName ? "selected" : "default")
          video.play();

          div.appendChild(video)
          div.appendChild(p)
          if (this.userName == userName && !this.currentFrame.nativeElement.children.length) {
            this.currentFrame.nativeElement.appendChild(div)
          }
          else {
            this.otherFrames.nativeElement.appendChild(div);
          }
          this.activeUsers.set(userId, stream)
        }
      })
    });
  };
  removeVideoStream(userId: string): void {
    console.log(userId)
    const escapedId = CSS.escape(userId)
    const parentElement = this.otherFrames.nativeElement.querySelector(`#${escapedId}`)
    if (parentElement) {
      parentElement.remove()
    }
  }

  connectToNewUser(userId: string, stream: MediaStream, peer: Peer): void {
    const call = peer.call(userId, stream);
    // this.activeUsers.set(userId, call);

    call.on("stream", (userVideoStream: any) => {
      console.log(`addVideoStream ${userId}`)
      this.addVideoStream(userVideoStream, userId);
    });

    call.on("close", () => {
      console.log(`close ${userId}`)
      this.activeUsers.delete(userId);
      this.removeVideoStream(userId)
      this.activeUsers.forEach(call => {
        call.close();
      });
      this.activeUsers.clear();
      peer.destroy();
    });

    call.on("error", err => {
      console.log("call error", err);
      this.activeUsers.delete(userId);
      this.removeVideoStream(userId);
    });

    ((call as any).peerConnection as any).oniceconnectionstatechange = () => {
      const state = (call as any).peerConnection.iceConnectionState;
      console.log("ICE state:", state);

      if (state === "disconnected" || state === "failed") {
        this.removeVideoStream(call.peer);
      }
    };
  }

  micro!: boolean
  displayMedia!: boolean

  // getSafeSrc(url: string): void {
  //   this.sanitizer.bypassSecurityTrustUrl(url)
  // }
}

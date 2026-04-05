import { Injectable, OnDestroy } from "@angular/core";
import { AppConfigService } from "../config/app-config.service";
import { io, Socket } from "socket.io-client";
import { StatusStorageObjService } from "../communication/status.storage.service";
import { EmitSocketNotificationEnum, NotificationTypes, OnSocketEnum, OnSocketMessangerEnum, OnSocketNotificationEnum, OnSocketUserEnum } from "../../etc/enum/socket.enum";
import { CommunicationService } from "../communication/communication.service";
import { ChatsHistoryService } from "../user/chats.service";
import { MeService } from "../user/me.service";
import { NotificationService } from "../user/notification.service";

@Injectable({
    providedIn: "root",
})
export class SocketNotificationService implements OnDestroy {
    constructor(
        private readonly appConfig: AppConfigService,
        private readonly comm: CommunicationService,
    ) { }

    #socket: Socket<any, any> | undefined

    ngOnDestroy(): void {
        this.disconnect()
    }
    connect() {
        this.#socket = io(`http://${this.appConfig.get('host')}:${this.appConfig.get('port')}`, {
            path: "/notifications",
            secure: false,
            transports: ["websocket"],
            withCredentials: true,
        });
        this.#socket.on(OnSocketEnum.CONNECT_ERROR, (err) => {
            console.log('Connection error:', err.message);
        });
        this.#socket.on(OnSocketEnum.CONNECT, () => {
            console.log("connected")
        });
        this.#socket!.on(OnSocketEnum.DISCONNECT, () => {
            console.log("disconnected")
        });
        this.#socket?.on(OnSocketNotificationEnum.NOTIFICATION_RECIEVED, (notification: Notification) => {
            console.log("NOTIFICATION")
            this.comm.send(OnSocketNotificationEnum.NOTIFICATION_RECIEVED, { active: true, payload: notification })
        });
    }

    disconnect() {
        this.#socket?.off(OnSocketEnum.CONNECT_ERROR)
        this.#socket?.off(OnSocketEnum.CONNECT)
        this.#socket?.off(OnSocketEnum.DISCONNECT)
        this.#socket?.disconnect()
    }

    emitNotificationSend(payload: { recieverId: any, notificationType: NotificationTypes, data: any }) {
        console.log("NOTIFICATION")
        this.#socket?.emit(EmitSocketNotificationEnum.NOTIFICATION_SEND, payload)
    }
}
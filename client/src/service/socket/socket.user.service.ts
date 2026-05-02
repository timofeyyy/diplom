import { Injectable, OnDestroy } from "@angular/core";
import { AppConfigService } from "../config/app-config.service";
import { io, Socket } from "socket.io-client";
import { StatusRecord, StatusStorageEnum, StatusStorageObjService } from "../communication/status.storage.service";
import { EmitSocketMessangerEnum, OnSocketEnum, OnSocketMessangerEnum, OnSocketUserEnum } from "../../etc/enum/socket.enum";
import { UserDto } from "../../dto/user.dto";
import { CommunicationService } from "../communication/communication.service";

@Injectable({
    providedIn: "root",
})
export class SocketUserService implements OnDestroy {
    constructor(
        private readonly appConfig: AppConfigService,
        private readonly storage: StatusStorageObjService,
        private readonly comm: CommunicationService,
    ) { }

    #socket: Socket<any, any> | undefined

    ngOnDestroy(): void {
        this.disconnect()
    }
    connect() {
        this.#socket = io(`http://${this.appConfig.get('host')}:${this.appConfig.get('port')}`, {
            path: "/main",
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
        this.#socket!.on(OnSocketUserEnum.USER_ONLINE, (_id: string, record: StatusRecord) => {
            console.log("user-online", _id)
            this.storage.send(_id, record, StatusStorageEnum.CONNECT)
        });
        this.#socket!.on(OnSocketUserEnum.USER_OFFLINE, (_id: string, record: StatusRecord) => {
            console.log("user-offline", _id)
            this.storage.send(_id, record, StatusStorageEnum.DISCONNECT)
        });
        this.#socket!.on(OnSocketUserEnum.LOAD_OTHER_USER_STATUS, (statusStoragePart: any) => {
            console.log('load-other-user-status', statusStoragePart)
            const users = Object.entries(statusStoragePart) as [string, any][]
            users.forEach((user) => {
                this.emitJoinChat(user[0])
            })

            this.storage.init(statusStoragePart)
        });
        this.#socket?.on(OnSocketMessangerEnum.LOAD_MESSAGES, (messages: any) => {
            if (Array.isArray(messages)) {
                this.comm.send(OnSocketMessangerEnum.LOAD_MESSAGES, messages)
            }
        });
        this.#socket?.on(OnSocketMessangerEnum.MESSAGE_RECIEVE, (document: any) => {
            // console.log("message-recieve", document)
            this.comm.send(OnSocketMessangerEnum.MESSAGE_RECIEVE, document)
        });
        this.#socket?.on(OnSocketMessangerEnum.CHAT_JOINED, (chatId: string) => {
            console.log(`${chatId} on chat joined`)
            if (chatId) {
                this.comm.send(OnSocketMessangerEnum.CHAT_JOINED, chatId)
            }
        })
        this.#socket?.on(OnSocketMessangerEnum.CHAT_HISTORY_UPDATE, () => {
            this.comm.send(OnSocketMessangerEnum.CHAT_HISTORY_UPDATE)

        })
        this.#socket?.on(OnSocketMessangerEnum.PROFILE_UPDATE, (sender: UserDto) => {
            this.comm.send(OnSocketMessangerEnum.PROFILE_UPDATE, sender)
        })
    }

    disconnect() {
        this.#socket?.off(OnSocketEnum.CONNECT_ERROR)
        this.#socket?.off(OnSocketEnum.CONNECT)
        this.#socket?.off(OnSocketEnum.DISCONNECT)
        this.#socket?.off(OnSocketUserEnum.USER_ONLINE)
        this.#socket?.off(OnSocketUserEnum.USER_OFFLINE)
        this.#socket?.off(OnSocketUserEnum.LOAD_OTHER_USER_STATUS)
        this.#socket?.off(OnSocketMessangerEnum.LOAD_MESSAGES)
        this.#socket?.off(OnSocketMessangerEnum.MESSAGE_RECIEVE)
        this.#socket?.off(OnSocketMessangerEnum.CHAT_JOINED)
        this.#socket?.off(OnSocketMessangerEnum.RECEIVER_STATUS_UPDATED)
        this.#socket?.off(OnSocketMessangerEnum.SENDER_STATUS_UPDATED)
        this.#socket?.off(OnSocketMessangerEnum.CHAT_HISTORY_UPDATE)
        this.#socket?.disconnect()
    }

    get isConnected() {
        return this.#socket?.connected
    }

    emitFriendRequests(chatId: string, recieverId: any, del: boolean) {
        console.log("emitFriendRequests", recieverId, chatId, del)
        this.#socket?.emit(EmitSocketMessangerEnum.RECEIVER_STATUS_UPDATE, { del: del, recieverId: recieverId, chatId: chatId })
    }

    emitAcceptOrDecline(chatId: string, recieverId: any, del: boolean) {
        console.log("emitFriendRequests", recieverId, chatId, del)
        this.#socket?.emit(EmitSocketMessangerEnum.SENDER_STATUS_UPDATE, { del: del, recieverId: recieverId, chatId: chatId })
    }

    emitJoinChat(userId: string) {
        this.#socket?.emit(EmitSocketMessangerEnum.JOIN_CHAT, userId);
    }

    emitSendMessage(data: { file: any, message: string, chatId: string }) {
        this.#socket?.emit(EmitSocketMessangerEnum.SEND_MESSAGE, data)
    }

    emitLoadMessage(chatId: string) {
        this.#socket?.emit(OnSocketMessangerEnum.LOAD_MESSAGES, chatId)
    }
}
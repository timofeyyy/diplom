import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, of } from "rxjs";
import { AppConfigService } from "../config/app-config.service";



@Injectable({
    providedIn: 'root'
})
export class UsersHttpService {
    constructor(
        private readonly httpClient: HttpClient,
        private readonly appConfig: AppConfigService
    ) { }

    chatsHistory() {
        return this.httpClient.get(`${this.appConfig.get("fullOrigin")}/users/chats/history`,
            { withCredentials: true }
        )
    }
    profile() {
        return this.httpClient.get(`${this.appConfig.get("fullOrigin")}/users/profile`, { withCredentials: true }
        )
    }

    update(param: string, value: any) {
        return this.httpClient.post(`${this.appConfig.get("fullOrigin")}/users/update/${param}`, { [`${param}`]: value }, { withCredentials: true, observe: 'response' }
        )
    }

    search(userName: string) {
        return this.httpClient.get(`${this.appConfig.get("fullOrigin")}/users/search/${userName}`, { withCredentials: true })
    }

    sendFriendRequest(recieverId: string) {
        return this.httpClient.post(`${this.appConfig.get("fullOrigin")}/users/friendRequest/send`, { recieverId: recieverId }, { withCredentials: true })
    }

    removeFriendRequest(recieverId: string) {
        return this.httpClient.post(`${this.appConfig.get("fullOrigin")}/users/friendRequest/remove`, { recieverId: recieverId }, { withCredentials: true })
    }

    chatExists(opponentId: string) {
        return this.httpClient.get(`${this.appConfig.get("fullOrigin")}/users/chat-exists/${opponentId}`, { withCredentials: true })
    }

    sendMessage(formData: FormData) {
        return this.httpClient.post(`${this.appConfig.get("fullOrigin")}/users/send-message`, formData, { withCredentials: true })
    }

    createVideoRoom() {
        return this.httpClient.post(`${this.appConfig.get("fullOrigin")}/users/create-video-room`, {}, { withCredentials: true })
    }

    getUserFriendRequests(userId: string) {
        return this.httpClient.get(`${this.appConfig.get("fullOrigin")}/users/user-friend-requests/${userId}`, { withCredentials: true })
    }
}

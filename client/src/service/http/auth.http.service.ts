import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, of, switchMap, tap } from "rxjs";
import { CommunicationService } from "../communication/communication.service";
import { EventsEnum } from "../../etc/enum/app.enum";
import { AppConfigService } from "../config/app-config.service";



@Injectable({
    providedIn: 'root'
})
export class AuthHttpService {
    constructor(
        private readonly httpClient: HttpClient,
        private readonly comm: CommunicationService,
        private readonly appConfig: AppConfigService

    ) { }

    login(username: string, password: string) {
        return this.httpClient.post(`${this.appConfig.get("fullOrigin")}/auth/login`, {
            username: username,
            password: password
        },
            { withCredentials: true }
        ).pipe(
            tap((res) => {
                console.log(res)
                this.comm.send(EventsEnum.LOGGED_IN, { active: true, payload: { user: res } })
            })
        )
    }

    logout() {
        return this.httpClient.post(`${this.appConfig.get("fullOrigin")}/auth/logout`, {},
            { withCredentials: true }
        )
    }

    userExists(email: string) {
        return this.httpClient.post(`${this.appConfig.get("fullOrigin")}/auth/user-exists`, {
            email: email
        },
            { withCredentials: true }
        )
    }

    newPassword(email: string, newPassword: string) {
        return this.httpClient.post(`${this.appConfig.get("fullOrigin")}/auth/new-password`, { email: email, newPassword: newPassword }, { withCredentials: true })
    }

    updatePassword(passid: string) {
        return this.httpClient.post(`${this.appConfig.get("fullOrigin")}/auth/update-password`, { passid: passid }, { withCredentials: true })
    }

    signUp(username: string, password: string) {
        return this.httpClient.post(`${this.appConfig.get("fullOrigin")}/auth/signUp`, {
            username: username,
            password: password
        },
            { withCredentials: true }
        )
    }

    refresh() {
        return this.httpClient.post(`${this.appConfig.get("fullOrigin")}/auth/refresh`, {}, { withCredentials: true })
    }
}

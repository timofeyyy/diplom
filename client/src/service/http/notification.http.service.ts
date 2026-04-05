import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, of } from "rxjs";
import { AppConfigService } from "../config/app-config.service";



@Injectable({
    providedIn: 'root'
})
export class NotificationHttpService {
    constructor(
        private readonly httpClient: HttpClient,
        private readonly appConfig: AppConfigService
    ) { }

    getNotifications() {
        return this.httpClient.get(`${this.appConfig.get("fullOrigin")}/api-notifications/select`, { withCredentials: true })
    }
}

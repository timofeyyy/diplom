import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AppConfigService } from "../config/app-config.service";

@Injectable({
    providedIn: 'root'
})
export class AvatarHistoryHttpService {
    constructor(
        private readonly httpClient: HttpClient,
        private readonly appConfig: AppConfigService
    ) { }

    load() {
        return this.httpClient.get(`${this.appConfig.get("fullOrigin")}/avatar-history/load`,{ withCredentials: true })
    }
    add(formData: FormData) {
        return this.httpClient.post(`${this.appConfig.get("fullOrigin")}/avatar-history/add`, formData, { withCredentials: true })
    }
    edit(payload: any, uri: string) {
        return this.httpClient.put(`${this.appConfig.get("fullOrigin")}/avatar-history/edit/${uri}`, payload, { withCredentials: true })
    }
    remove(uri: string) {
        return this.httpClient.delete(`${this.appConfig.get("fullOrigin")}/avatar-history/remove/${uri}`, { withCredentials: true })
    }
}

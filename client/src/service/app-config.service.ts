import { HttpClient } from "@angular/common/http";
import { Inject, Injectable, OnInit } from "@angular/core";
import { Observable } from "rxjs";


@Injectable(
{ providedIn: 'root' }
)
export class AppConfigService {
    constructor(
        private httpClient: HttpClient
    ) { }

    getConfig(): Observable<any> {
        return this.httpClient.get("/assets/appsettings.json")
    }
}
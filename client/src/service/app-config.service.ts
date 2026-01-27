import { HttpClient } from "@angular/common/http";
import { Inject, Injectable, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { PlatformLocation } from '@angular/common';

@Injectable(
{ providedIn: 'root' }
)
export class AppConfigService {
    constructor(
        private httpClient: HttpClient,
        private platformLocation: PlatformLocation
    ) { }

    getConfig(): Observable<any> {
        const baseHref = this.platformLocation.getBaseHrefFromDOM()
        return this.httpClient.get(`${baseHref}assets/appsettings.json`)
    }
}
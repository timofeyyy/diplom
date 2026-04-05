import { HttpClient } from "@angular/common/http";
import { Injectable, Injector } from "@angular/core";
import { catchError, finalize, from, Observable, of, shareReplay, switchMap } from "rxjs";
import { AuthHttpService } from "./auth.http.service";
import { Router } from "@angular/router";
import { CommunicationService } from "../communication/communication.service";
import { AuthActions } from "../../etc/enum/settings.enum";
import { SocketUserService } from "../socket/socket.user.service";
import { SocketNotificationService } from "../socket/socket.notification.service";


@Injectable({
    providedIn: 'root'
})
export class AuthHttpRequirementService {
    constructor(
        private readonly authHttp: AuthHttpService,
        private readonly socketUser: SocketUserService,
        private readonly comm: CommunicationService,
        private readonly notficationService: SocketNotificationService,
    ) { }

    // private get socketMessangerService(): SocketMessangerService {
    //     return this.injector.get(SocketMessangerService);
    // }

    // require(obs: Observable<any>) {
    //     return obs.pipe(
    //         catchError((err) => this.authHttp.refresh()
    //             .pipe(
    //                 catchError((err) => {
    //                     console.log("refresh err")
    //                     this.comm.send(AuthActions.LOG_OUT, { active: false, payload: {} })
    //                     return of(err)
    //                 }),

    //                 switchMap((data) => {
    //                     if (!this.connection.isConnected) {
    //                         this.connection.connect()
    //                         this.socketMessangerService.initHandlers()
    //                     }
    //                     if (!data) {
    //                         return obs
    //                     }
    //                     return of(data.err)
    //                 }
    //                 ),
    //                 switchMap((data) => {
    //                     console.log("refresh switchMap1")
    //                     console.log(data)
    //                     return of(data)
    //                 })
    //             )

    //         )
    //     )

    // }
    private refresh$: Observable<any> | null = null;
    require(obs: Observable<any>) {
        return obs.pipe(
            catchError(() => {
                if (!this.refresh$) {
                    this.refresh$ = this.authHttp.refresh().pipe(
                        switchMap((data) => {
                            // if (!this.socketUser.isConnected) {
                                this.socketUser.connect();
                                this.notficationService.connect()
                                // this.socketMessangerService.initHandlers();
                            // }
                            return of(data);
                        }),
                        catchError((err) => {
                            console.log("refresh err");
                            this.comm.send(AuthActions.LOG_OUT, { active: false, payload: {} });
                            return of(null);
                        }),
                        shareReplay(1),
                        finalize(() => {
                            this.refresh$ = null;
                        })
                    );
                }

                return this.refresh$.pipe(
                    switchMap((data) => {
                        if (!data) return obs;
                        return obs;
                    })
                );
            })
        );
    }

}

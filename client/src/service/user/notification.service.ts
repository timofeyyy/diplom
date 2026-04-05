import { Injectable } from "@angular/core";
import { SettingsOptions } from "../../etc/enum/settings.enum";
import { UserDto } from "../../dto/user.dto";
import { AuthHttpRequirementService } from "../http/auth.http.requirements.service";
import { UsersHttpService } from "../http/users.http.service";
import { BehaviorSubject, take } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";
import { NotificationHttpService } from "../http/notification.http.service";
import { CommunicationBehaivorService } from "../communication/communication.behaivor.service";
import { NotificationDto } from "../../dto/notification.dto";

@Injectable({
    providedIn: 'root'
})
export class NotificationService {


    constructor(
        private readonly notificationHttp: NotificationHttpService,
        private readonly httpReuirements: AuthHttpRequirementService,
        private readonly behaviorComm: CommunicationBehaivorService
    ) { }

    update() {
        this.httpReuirements.require(this.notificationHttp.getNotifications())
            .subscribe((res: (any | HttpErrorResponse)) => {
                if (res) {
                    if ("error" in res) {
                    }
                    else {
                        console.log(res)
                        this.setSource(res)
                        // this.#behaiverSubject.next(res)
                    }
                }
            })
    }

    setSource(notofications: NotificationDto[]) {
        this.behaviorComm.send(NotificationService.name, { active: true, payload: notofications })
    }


    // setUnsafe(notofications: NotificationDto[]) {
    //     this.#behaiverSubject.next(notofications)
    // }

    appendUnsafe(notification: NotificationDto) {
        this.listen()
            .pipe(take(1))
            .subscribe((res: any) => {
                console.log(res)
                const notofications: NotificationDto[] = res.payload
                notofications.push(notification)
                this.setSource(notofications)
            })
    }

    // #behaiverSubject: BehaviorSubject<any> = new BehaviorSubject([])

    listen() {
        return this.behaviorComm.listen(NotificationService.name)
        // return this.#behaiverSubject.asObservable()
    }
}
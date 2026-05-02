import { Injectable } from "@angular/core";
import { RefreshHttpService } from "../http/refresh.service";
import { NotificationHttpService } from "../http/notification.http.service";
import { NotificationDto } from "../../dto/notification.dto";
import { catchError, of, take } from "rxjs";
import { NotificationMainTypes } from "../../etc/enum/notification.enum";
import { CommunicationReplayService } from "../communication/communication.replay.service";

export interface NotificationTypesList {
    [NotificationMainTypes.EVENTS]: NotificationDto[],
    [NotificationMainTypes.REQUESTS]: NotificationDto[],
    [NotificationMainTypes.MENTIONS]: NotificationDto[]
}

export interface NotificationCounters {
    [NotificationMainTypes.EVENTS]: number,
    [NotificationMainTypes.REQUESTS]: number,
    [NotificationMainTypes.MENTIONS]: number
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {

    notifications: NotificationTypesList = {
        [NotificationMainTypes.EVENTS]: [],
        [NotificationMainTypes.REQUESTS]: [],
        [NotificationMainTypes.MENTIONS]: [],
    }

    constructor(
        private readonly notificationHttp: NotificationHttpService,
        private readonly refreshHttpService: RefreshHttpService,
        private readonly replayComm: CommunicationReplayService
    ) { }

    update() {
        this.refreshHttpService.require(this.notificationHttp.getNotifications())
            .pipe(catchError((err) => of(err)))
            .subscribe((res) => {
                if (res) {
                    this.setSource(res)
                }
            })
    }

    setSource(notifications: NotificationDto[]) {
        this.notifications[NotificationMainTypes.EVENTS] = notifications.filter((notification) => notification.notificationMainType == NotificationMainTypes.EVENTS)
        this.notifications[NotificationMainTypes.REQUESTS] = notifications.filter((notification) => notification.notificationMainType == NotificationMainTypes.REQUESTS)
        this.notifications[NotificationMainTypes.MENTIONS] = notifications.filter((notification) => notification.notificationMainType == NotificationMainTypes.MENTIONS)
        this.replayComm.send(NotificationService.name, this.notifications)
    }

    appendUnsafe(notification: NotificationDto) {
        this.listen()
            .pipe(take(1))
            .subscribe((res: any) => {
                if (res) {
                    const key = notification.notificationMainType
                    this.notifications[key].push(notification)
                    this.replayComm.send(NotificationService.name, this.notifications)
                }
            })
    }

    listen() {
        return this.replayComm.listen(NotificationService.name)
    }
}
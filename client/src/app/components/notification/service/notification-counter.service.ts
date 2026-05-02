import { Injectable } from "@angular/core";
import { NotificationCounters, NotificationService, NotificationTypesList } from "../../../../service/user/notification.service";
import { NotificationMainTypes } from "../../../../etc/enum/notification.enum";
import { CommunicationBehaivorService } from "../../../../service/communication/communication.behaivor.service";
import { NotificationDto } from "../../../../dto/notification.dto";
import { take } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class NotificationCounterService {

    counterObj!: NotificationCounters

    constructor(
        private readonly notificationService: NotificationService,
        private readonly behaviorComm: CommunicationBehaivorService
    ) { }

    markAsReaded(eventType: NotificationMainTypes, notifications: NotificationDto[]) {
        this.notificationService.listen().subscribe((res: NotificationTypesList) => {
            const counterObj: NotificationCounters = this.counterObj
            counterObj[eventType] = res[eventType].length - notifications.length
            this.counterObj = counterObj
            console.log(this.counterObj)
            localStorage.setItem("notification_counter", JSON.stringify(this.counterObj))
            this.setSource(counterObj)
        })
    }

    update() {
        const counterObj: NotificationCounters = JSON.parse(localStorage.getItem("notification_counter") as string)
        if (counterObj) {
            this.counterObj = counterObj
        }
        this.notificationService.listen().pipe(take(1)).subscribe((res: NotificationTypesList) => {
            if (!this.counterObj) {
                this.counterObj = {
                    [NotificationMainTypes.EVENTS]: 0,
                    [NotificationMainTypes.REQUESTS]: 0,
                    [NotificationMainTypes.MENTIONS]: 0
                }
                localStorage.setItem("notification_counter", JSON.stringify(this.counterObj))
              
            }
            // console.log(this.counterObj)
            // const diff: NotificationCounters = {
            //     [NotificationMainTypes.EVENTS]: res[NotificationMainTypes.EVENTS].length - this.counterObj[NotificationMainTypes.EVENTS],
            //     [NotificationMainTypes.REQUESTS]: res[NotificationMainTypes.REQUESTS].length - this.counterObj[NotificationMainTypes.REQUESTS],
            //     [NotificationMainTypes.MENTIONS]: res[NotificationMainTypes.MENTIONS].length - this.counterObj[NotificationMainTypes.MENTIONS],
            // }
            this.setSource(this.counterObj)
        })
    }

    setSource(data: NotificationCounters) {
        this.behaviorComm.send(NotificationCounterService.name, data)
    }

    listen() {
        return this.behaviorComm.listen(NotificationCounterService.name)
    }
}
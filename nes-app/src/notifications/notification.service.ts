import { Injectable } from "@nestjs/common";
import { CommunicationBehaivorService } from "src/etc/service/communication.behaivor.service";
import { Notification } from "src/mongodb/notification/notification.schema";
import { MongoNotificationService } from "src/mongodb/notification/notification.service";

@Injectable()
export class NotificationService {

    constructor(
        private readonly communicationBehaivorService: CommunicationBehaivorService,
        private readonly mongoNotificationService: MongoNotificationService
    ) {}

    async send(payload: Partial<Notification>) {
        const notification = await this.mongoNotificationService.create(payload)
        console.log(`${NotificationService.name}:${payload.userId}`)
        // console.log(notification)
        this.communicationBehaivorService.send(`${NotificationService.name}:${payload.userId}`, notification)
    }

    listen(userId: string) {
        // console.log(`${NotificationService.name}:${userId}`)
        return this.communicationBehaivorService.listen(`${NotificationService.name}:${userId}`)
    }
}   
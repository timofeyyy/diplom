import { Injectable } from "@nestjs/common";
import { NotificationTypes } from "src/etc/enum/notifications.enum";

@Injectable()
export class NotificationService {
    constructor(
        
    ) { }


    buildNotification(payload: { recieverId: any, notificationType: NotificationTypes, data: any}) {
        switch(payload.notificationType) {
            case NotificationTypes.FRIEND_REQUEST_CANCELED: {
                return `Пользователь ${payload.data.userName} удалил вас из друзей`
            }
            case NotificationTypes.FRIEND_REQUEST_SENDED: {
                return `Пользователь ${payload.data.userName} отправил вам запрос на дружбу`
            }
             case NotificationTypes.MESSEAGE_RECEIVE: {
                return `У вас непрочитанные сообщения от ${payload.data.userName}`
            }
            // case NotificationTypes.UNREAD_MESSAGES
        }
    }


}
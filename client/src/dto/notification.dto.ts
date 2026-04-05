import { NotificationTypes } from "../etc/enum/socket.enum"

export interface NotificationDto {
    notificationType: NotificationTypes
    recieverId: string,
    createdAt: Date,
    message: string,
    data: any
}
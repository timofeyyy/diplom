import { FriendStatusEnum, NotificationMainTypes, NotificationTypes } from "../etc/enum/notification.enum"

export interface NotificationDto {
    notificationType: NotificationTypes | FriendStatusEnum,
    notificationMainType: NotificationMainTypes,
    userId: string,
    createdAt: Date,
    data: any
}
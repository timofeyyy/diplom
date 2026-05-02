import { FriendStatusEnum } from "../etc/enum/notification.enum"
import { AvatarSettings } from "../service/avatar/avatar.dto"

export class UserDto {
    avatar!: string
    defaultAvatar!: string
    email!: string
    userName!: string
    birthday?: string
    isRelative!: boolean
    friendRequests!: { receiverId: string, status: FriendStatusEnum }[]
    isFriend!: boolean
    duoChat!: any
    displayAvatarSettings?: AvatarSettings
    status: Partial<{
        lastTime: Date,
        show: boolean,
        online: boolean
    }> = {}
    _id!: string
}
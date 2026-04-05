export class UserDto {
    avatar!: string
    email!: string
    userName!: string
    birthday?: string
    isRelative!: boolean
    friendRequests!: string[]
    isFriend!: boolean
    duoChat!: any
    // password!: string
    status: Partial<{
        lastTime: Date,
        show: boolean,
        online: boolean 
    }> = {}
    _id!: string
}
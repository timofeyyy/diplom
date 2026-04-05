import { Injectable } from '@nestjs/common';
import { MongoUserService } from 'src/mongodb/user/user.service';
import { User } from 'src/mongodb/user/user.schema';

@Injectable()
export class UserService {
    constructor(
        private readonly mongoUserService: MongoUserService,
    ) { }

    #checks: Map<string, (value: string) => (string | null)> = new Map()
        .set("birthday", (value: string) => {
            const date = Date.parse(value)
            if (isNaN(date)) {
                return "Not valid format needs to be yyyy.mm.dd"
            }
            const dateObject = new Date(date);
            const year = dateObject.getFullYear()
            const currentYear = new Date().getFullYear()
            return year >= 1970 && currentYear - 12 > year ? null : `Year must >= 1970 and < ${currentYear - 12}`
        })
        .set("userName", (value: string) => {
            const hasRussian = /[а-яА-ЯёЁ]/.test(value);
            if (hasRussian) {
                return "UserName cannot contain cirilic symbols"
            }
            if (value.length < 6) {
                return "Length must be more then 5 symbols"
            }
            return null
        })
        .set("lastSeenStatus", (user: User, show: boolean) => {
            return null
        })

    #updates: Map<string, (user: User, value: any) => Promise<(any)>> = new Map()
        .set("birthday", async (user: User, value: string) => {
            const date = Date.parse(value)
            const dateObject = new Date(date);
            user.birthday = dateObject
            const updated = await this.mongoUserService.findOneAndUpdate({ email: user.email }, user)
            console.log(updated)
            if (updated) {
                return { statusCode: 200, transcript: 'OK', message: 'Changes are accepted', body: updated }
            }
            return "Could not update"

        })
        .set("userName", async (user: User, value: string) => {
            const updated = await this.mongoUserService.findOneAndUpdate({ email: user.email }, user)
            if (updated) {
                return { statusCode: 200, transcript: 'OK', message: 'Changes are accepted', body: updated }
            }
            return "This username has already been taken"
        })
        .set("lastSeen", async (user: User) => {
            user.status.lastTime = new Date()
            const updated = await this.mongoUserService.findOneAndUpdate({ email: user.email }, user)
            if (updated) {
                return { statusCode: 200, transcript: 'OK', message: 'Changes are accepted', body: updated }
            }
            return "Coudn't set last date seen"
        })
        .set("lastSeenStatus", async (user: User, show: boolean) => {
            user.status.show = show
            const updated = await this.mongoUserService.findOneAndUpdate({ email: user.email }, user)
            if (updated) {
                return { statusCode: 200, transcript: 'OK', message: 'Status changed', body: updated }
            }
            return "Coudn't change status"
        })

    validate(param: string, value: any) {
        if (!this.#checks.has(param)) {
            return undefined
        }
        const check = this.#checks.get(param)!
        return check(value)
    }

    async upd(param: string, value: any, user: User) {
        if (!this.#updates.has(param)) {
            return undefined
        }
        const upd = this.#updates.get(param)!
        return await upd(user, value)
    }
}

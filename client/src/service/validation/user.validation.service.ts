import { Injectable } from "@angular/core";

@Injectable()
export class UserValidationService {

 
    #checks: Map<string, (value: string) => (string | null)> = new Map()
        .set("birthday", (value: string) => {
            const date = Date.parse(value)
            if (isNaN(date)) {
                return "Дата должна быть в формате yyyy.mm.dd"
            }
            const dateObject = new Date(date);
            const year = dateObject.getFullYear()
            const currentYear = new Date().getFullYear()
            return year >= 1970 && currentYear - 12 > year ? null : `Year must >= 1970 and < ${currentYear - 12}`
        })
        .set("userName", (value: string) => {
            const hasRussian = /[а-яА-ЯёЁ]/.test(value);
            if (hasRussian) {
                return "логин не должен содержать русских символов"
            }
            if (value.length < 6) {
                return "Длина пароля должна быть больше чем 5 символов"
            }
            return null
        })


    getChecks(keys: string[] | void) {
        let all = Array.from(this.#checks.entries())
        if (keys) {
            const checks: [string, (value: string) => string | null][] = []
            keys.forEach((key) => {
                const check = all.find((check) => check[0].toLowerCase() == key.toLowerCase())
                if (check) {
                    checks.push(check)
                }
            })
            all = checks
        }
        return all
            .map((check: [string, (value: string) => string | null]) => {
                return check[1]
            })
    }
}
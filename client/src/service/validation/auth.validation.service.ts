import { Injectable } from "@angular/core"
import { FromAuthDto } from "../../dto/warning.dto"
import { AuthHttpService } from "../http/auth.http.service"
import { lastValueFrom } from "rxjs"
import { EventNotifierService } from "../../app/components/events/common/services/event-notifier.service"

@Injectable() 
export class FromAuthMediater {
    validation: FromAuthDto = new FromAuthDto()
    constructor(
        private readonly authHttp: AuthHttpService,
        private readonly eventNotifierService: EventNotifierService
    ) { }

    alertWindow: boolean = false
    reset(propStr: string | void) {
        if (!propStr || propStr == "email") {
            this.validation.email.error = undefined
        }
        if (!propStr || propStr == "password") {
            this.validation.password.error = undefined
        }
        if (!propStr || propStr == "repeatPassword") {
            this.validation.repeatPassword.error = undefined 
        }
        if (!propStr || propStr == "alertWindowError") {
            this.validation.alertWindow = undefined
        }
    }
    #checks: Map<string, (() => boolean)> = new Map()
        .set("email", () => {
            let res = null
            if (this.validation.email.value) {
                res = this.validateEmail(this.validation.email.value);
            }
            if (res) {
                this.reset("email")
            }
            else {
                this.validation.email.error = "Почта должна иметь верный формат"
            }

            return Boolean(res)
        })
        .set("email-domen", () => {
            let res = false
            if (this.validation.email.value) {
                const sps = this.validation.email.value.split('@');
                const domain = sps[sps.length - 1];
                const domains = ['gmail.com'];
                res = domains.includes(domain)
                if (res) {
                    this.reset("email")
                }
                else {
                    this.validation.email.error = "Домен не разрешен"
                }
            }
            return res
        })
        .set("password-validation-log-in", () => {
            const value = this.validation.password.value
            const res = value && value.length >= 8
            if (res) {
                this.reset("password")
            }
            else if (!value) {
                this.validation.password.error = "Обязательно к заполнению"
            }
            else if (value.length < 8) {
                this.validation.password.error = "Длина пароля должна быть больше чем 8 символов"
            }

            return res
        })
        .set("password-validation-sign-up", () => {
            const value = this.validation.password.value
            const charValidation = value && this.hasUppercaseAndNumber(value)
            const res = charValidation && value.length >= 8
            if (res) {
                this.reset("password")
            }
            else if (!value) {
                this.validation.password.error = "Обязательно к заполнению"
            }
            else if (value.length < 8) {
                this.validation.password.error = "Длина пароля должна быть больше чем 8 символов"
            }
            else {
                this.validation.password.error = "Пароль должен содеражть и заглавные буквы и числа"
            }

            return res
        })
        .set("password-repeat", () => {
            const res = this.validation.password.value && this.validation.password.value === this.validation.repeatPassword.value
            if (res) {
                this.reset("repeatPassword")
            }
            else if (!this.validation.password.value) {
                this.validation.password.error = "Обязательно к заполнению"
            }
            else {
                this.validation.repeatPassword.error = "Оба поля с паролем должны совпадать"
            }
            return res
        })
        .set("log-in", async () => {
            try {
                const httpAnswer = this.authHttp.login(this.validation.email.value!, this.validation.password.value!)
                const data = await lastValueFrom(httpAnswer);
                return true
            }
            catch (err: any) {
                this.validation.alertWindow = { ...err.error, transcript: err.error.error }
                this.eventNotifierService.errorNotify(err.error.message)
                this.alertWindow = true
                return false
            }
        })
        .set("sign-up", async () => {
            try {
                const httpAnswer = this.authHttp.signUp(this.validation.email.value!, this.validation.password.value!)
                await lastValueFrom(httpAnswer);
                return true
            }
            catch (err: any) {
                this.validation.alertWindow = err.error
                this.eventNotifierService.errorNotify(err.error.message)
                this.alertWindow = true
                return false
            }
        })
        .set("email-exists", async () => {
            try {
                const httpAnswer = this.authHttp.userExists(this.validation.email.value!)
                const data = await lastValueFrom(httpAnswer);
                return true
            }
            catch (err: any) {
                this.validation.alertWindow = { ...err.error, transcript: err.error.error }
                this.eventNotifierService.errorNotify(err.error.message)
                return false
            }
        })

    validateEmail(email: string) {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    hasUppercaseAndNumber(str: string) {
        const hasUppercase = /[A-Z]/.test(str);
        const hasNumber = /[0-9]/.test(str);
        return hasUppercase && hasNumber;
    }

    getChecks(keys: string[] | void) {
        let all = Array.from(this.#checks.entries())
        if (keys) {
            const checks: [string, () => boolean][] = []
            keys.forEach((key) => {
                const check = all.find((check) => check[0].toLowerCase() == key.toLowerCase())
                if (check) {
                    checks.push(check)
                }
            })
            all = checks
        }
        return all
            .map((check: [string, () => boolean]) => {
                return check[1]
            })
    }
}
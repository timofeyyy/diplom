import { Injectable } from "@angular/core";
import { SettingsOptions } from "../../etc/enum/settings.enum";
import { Dispatch } from "../communication/settings.communication.service";


@Injectable()
export class SettingsLayoutHistoryService {
    #states: Dispatch<SettingsOptions>[] = []

    push(settingsWindowData: Dispatch<SettingsOptions>) {
        this.#states.push(settingsWindowData)
    }

    getLast() {
        return this.#states.length > 0 ? this.#states[this.#states.length - 1] : undefined
    }

    pop() {
        this.#states.pop()
    }

    clear() {
        while(this.#states[0]) {
            this.#states.pop()
        }
    }

    get length() {
        return this.#states.length
    }
}
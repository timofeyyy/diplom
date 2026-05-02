import { Injectable } from "@angular/core";
import { SettingsOptions } from "../../etc/enum/settings.enum";

@Injectable()
export class SettingsHistoryService {
    #states: SettingsOptions[] = []

    push(state: SettingsOptions) {
        this.#states.push(state)
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
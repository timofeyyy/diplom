import { Injectable } from "@nestjs/common";
import { Observable, Subject } from "rxjs";

@Injectable()
export class CommunicationService {
    #channels: Map<string, Partial<{
        subject: Subject<any>,
        listener: () => Observable<any>,
        sender: (data: any) => void
    }>> = new Map()

    listen(action: string) {
        let channel = this.#channels.get(action)
        if (!channel) {
            channel = this.#initAction(action)
        }
        if (!channel.listener) {
            channel!.listener = () => channel.subject!.asObservable();
            this.#channels.set(action, channel)
        }
        return channel.listener()
    }

    send(action: string, data: any = undefined) {
        let channel = this.#channels.get(action)
        if (!channel) {
            channel = this.#initAction(action)
        }
        if (!channel.sender) {
            channel.sender = (data) => channel.subject!.next(data)
            this.#channels.set(action, channel)
        }
        return channel.sender(data)
    }

    #initAction(action: string) {
        const channel = {
            subject: new Subject<any>()
        }
        this.#channels.set(action, channel)
        return channel
    }
}   
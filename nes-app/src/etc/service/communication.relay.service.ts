import { Injectable, Logger } from "@nestjs/common";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable()
export class CommunicationBehaivorService {
  #channels = new Map<string, BehaviorSubject<any>>()
  #logger = new Logger(CommunicationBehaivorService.name)
  listen(action: string): Observable<any> {
    return this.#getChannel(action).asObservable()
  }

  send(action: string, data: any) {
    const channel = this.#getChannel(action)
    channel.next(data)
  }

  #getChannel(action: string): BehaviorSubject<any> {
    let channel = this.#channels.get(action)
    if (!channel) {
      channel = new BehaviorSubject<any>(undefined)
      this.#channels.set(action, channel)
    }
    return channel
  }
}
// NotificationService:69e740c45a9b33f0fee11366
// NotificationService:69e740c45a9b33f0fee11366
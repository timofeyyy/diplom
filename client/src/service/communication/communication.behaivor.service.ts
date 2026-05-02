import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CommunicationBehaivorService {
  #channels = new Map<string, BehaviorSubject<any>>()

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
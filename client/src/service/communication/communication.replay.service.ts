import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, ReplaySubject } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CommunicationReplayService {
  #channels = new Map<string, ReplaySubject<any>>()

  listen(action: string): Observable<any> {
    return this.#getChannel(action).asObservable()
  }

  send(action: string, data: any) {
    const channel = this.#getChannel(action)
    channel.next(data)
  }

  #getChannel(action: string): ReplaySubject<any> {
    let channel = this.#channels.get(action)
    if (!channel) {
      channel = new ReplaySubject<any>(1)
      this.#channels.set(action, channel)
    }
    return channel
  }
}
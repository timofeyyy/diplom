import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

export interface Dispatch<T> {
  action: T | undefined
  payload: any
}

export interface WindowOptions {
  active: boolean
  payload: any
}

@Injectable({
  providedIn: 'root'
})
export class CommunicationBehaivorService {

  #channels = new Map<string, BehaviorSubject<Dispatch<any>>>()

  listen(action: string): Observable<Dispatch<any>> {
    return this.#getChannel(action).asObservable()
  }

  send(action: string, data: WindowOptions) {
    const channel = this.#getChannel(action)

    channel.next({
      action: data.active ? action : undefined,
      payload: data.payload
    })
  }

  #getChannel(action: string): BehaviorSubject<Dispatch<any>> {
    let channel = this.#channels.get(action)

    if (!channel) {
      channel = new BehaviorSubject<Dispatch<any>>({
        action: undefined,
        payload: null
      })

      this.#channels.set(action, channel)
    }

    return channel
  }
}
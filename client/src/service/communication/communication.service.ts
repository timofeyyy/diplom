import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";

export interface Dispatch<T> {
  action: T | undefined, 
  payload: any
}

export interface WindowOptions {
  active: boolean,
  payload: any
}

@Injectable({
  providedIn: 'root'
})
export class CommunicationService {
  #channels: Map<string, Partial<{
    subject: Subject<any>,
    listener: () => Observable<Dispatch<any>>,
    sender: (data: WindowOptions) => void
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

  send(action: string, data: WindowOptions) {
    let channel = this.#channels.get(action)
    if (!channel) {
      channel = this.#initAction(action)
    }
    if (!channel.sender) {
      channel.sender = (data) => channel.subject!.next(this.#proccesState(action, data))
      this.#channels.set(action, channel)
    }
    return channel.sender(data)
  }

  #proccesState(action: string, data: WindowOptions): Dispatch<any> {
    return {
      payload: data.payload,
      action: data.active ? action : undefined
    }
  }

  #initAction(action: string) {
    const channel = {
      subject: new Subject<any>()
    }
    this.#channels.set(action, channel)
    return channel
  }
}

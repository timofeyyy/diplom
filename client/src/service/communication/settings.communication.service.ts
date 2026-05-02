import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { SettingsHistoryEnum } from "../../app/components/popup-settings-options/popup-settings-options";
import { SettingsOptions } from "../../etc/enum/settings.enum";

export interface Dispatch<T> {
  action: T | undefined, 
  payload: any
}

@Injectable({
  providedIn: 'root'
})
export class SettingsCommunicationService {
  #channels: Map<string, Partial<{
    subject: Subject<Dispatch<SettingsOptions> | undefined>,
    listener: () => Observable<Dispatch<SettingsOptions> | undefined>,
    sender: (data: Dispatch<SettingsOptions> | undefined) => void
  }>> = new Map()

  listen(action: SettingsHistoryEnum) {
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

  send(action: SettingsHistoryEnum, data: Dispatch<SettingsOptions> | undefined = undefined) {
    let channel = this.#channels.get(action)
    if (!channel) {
      channel = this.#initAction(action)
    }
    if (!channel.sender) {
      channel.sender = (data: Dispatch<SettingsOptions> | undefined) => channel.subject!.next(data)
      this.#channels.set(action, channel)
    }
    return channel.sender(data)
  }

  #initAction(action: string) {
    const channel = {
      subject: new Subject<Dispatch<SettingsOptions> | undefined>()
    }
    this.#channels.set(action, channel)
    return channel
  }
}

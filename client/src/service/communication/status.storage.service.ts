import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";


export enum StatusStorageEnum {
  CONNECT = "add",
  DISCONNECT = "disconnect"
}

export interface StatusRecord {
  date: any,
  online: boolean
}

@Injectable({
  providedIn: 'root'
})
export class StatusStorageObjService {

  #storage: any = {}
  #subject: BehaviorSubject<any> = new BehaviorSubject(this.#storage)

  init(storage: {}) {
    this.#storage = storage
    return this.#subject.next(this.#storage)
  }

  listen() {

    return this.#subject.asObservable()
  }

  send(id: string, record: StatusRecord, action: StatusStorageEnum) {
    this.#storage[id] = record
    // console.log(this.#storage)
    return this.#subject.next(this.#storage)
  }
}
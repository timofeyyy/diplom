import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { UserDto } from "../../dto/user.dto";

// export interface Dispatch<T> {
//   action: T | undefined,
//   payload: any
// }

// export interface WindowOptions {
//   active: boolean,
//   payload: any
// }

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
    // if (action == StatusStorageEnum.CONNECT) {
      // console.log(id)
      this.#storage[id] = record
    // }
    // if (action == StatusStorageEnum.DISCONNECT) {
    //   this.#storage.delete(id)
    // }
    console.log(this.#storage)
    return this.#subject.next(this.#storage)
  }
}



// export class StatusStorageService {

//   #storage: Set<string> = new Set()
//   #subject: BehaviorSubject<any> = new BehaviorSubject(this.#storage)

//   init(set: Set<string>) {
//     this.#storage = set
//     return this.#subject.next(this.#storage)
//   }

//   listen() {

//     return this.#subject.asObservable()
//   }

//   send(record: StatusRecoed, action: StatusStorageEnum) {
//     if (action == StatusStorageEnum.CONNECT) {
//       console.log(id)
//       this.#storage.add(id)
//     }
//     if (action == StatusStorageEnum.DISCONNECT) {
//       this.#storage.delete(id)
//     }
//     console.log(this.#storage)
//     return this.#subject.next(this.#storage)
//   }
// }
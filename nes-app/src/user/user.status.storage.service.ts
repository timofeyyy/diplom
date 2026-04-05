import { Injectable } from "@nestjs/common";
import { Server, Socket } from 'socket.io'
// @Injectable()
// export class UserStatusStorageService {
//     #usersActivity: any = {} 

//     setActivityStatus(id: string, online: boolean) {
//         this.#usersActivity[id] = { stat: online, lastSeen: new Date() }
//     }
//     getStat(id: string) {
//         return this.#usersActivity[id]
//     }
//     isOnline(id: string) {
//         return this.#usersActivity[id]?.stat
//     }
    
//     monitore() {
//         return this.#usersActivity
//     }
// }

export interface StatusRecoed {
  id: string,
  date: any 
}
@Injectable()
export class UserStatusStorageService {
    #usersActivity: { [key: string] : { online: boolean | undefined, date: Date, socket: Socket}} = {} 

    setActivityStatus(socket: Socket, online: boolean | undefined) {
        this.#usersActivity[(socket as any).userId] = { online: online, date: new Date(), socket: socket }
    }
    // isOnline(id: string) {
    //     return this.#usersActivity[id]?.online
    // }
    getRecord(id:string) {
        return this.#usersActivity[id]
    }
    monitore() {
        return this.#usersActivity
    }
    // getAll() {
    //     return this.#usersActivity
    // }
    // saveChanges(records: { online: boolean, date: Date, socket: Socket}) {
    //     this.#usersActivity = {...this.#usersActivity, records} 
    // }
}

// @Injectable()
// export class UserStatusStorageService {
//     #usersActivity: any = {} 

//     setActivityStatus(id: string, online: boolean) {
//         this.#usersActivity[id] = online
//     }
//     isOnline(id: string) {
//         return this.#usersActivity[id]
//     }
    
//     monitore() {
//         return this.#usersActivity
//     }
// }
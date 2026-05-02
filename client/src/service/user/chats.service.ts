import { Injectable } from "@angular/core";
import { SettingsOptions } from "../../etc/enum/settings.enum";
import { RefreshHttpService } from "../http/refresh.service";
import { UsersHttpService } from "../http/users.http.service";
import { BehaviorSubject, take } from "rxjs";
import { CommunicationBehaivorService } from "../communication/communication.behaivor.service";

@Injectable({
    providedIn: 'root'
})
export class ChatsHistoryService {

    constructor(
        private readonly usersHttp: UsersHttpService,
        private readonly refreshHttpService: RefreshHttpService,
        private readonly behaviorComm: CommunicationBehaivorService

    ) { }

    update() {
        this.refreshHttpService.require(this.usersHttp.chatsHistory())
            .pipe(take(1))
            .subscribe((res) => {
                console.log(res)
                if (res) {
                    this.setSource(res)
                }
            })
    }

    getChatId() {
        
    }

    setSource(data: any[]) {
        this.behaviorComm.send(ChatsHistoryService.name, data)
    }

    listen() {
        return this.behaviorComm.listen(ChatsHistoryService.name)
    }
}
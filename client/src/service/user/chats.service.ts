import { Injectable } from "@angular/core";
import { SettingsOptions } from "../../etc/enum/settings.enum";
import { AuthHttpRequirementService } from "../http/auth.http.requirements.service";
import { UsersHttpService } from "../http/users.http.service";
import { BehaviorSubject, take } from "rxjs";
import { CommunicationBehaivorService } from "../communication/communication.behaivor.service";

@Injectable({
    providedIn: 'root'
})
export class ChatsHistoryService {

    constructor(
        private readonly usersHttp: UsersHttpService,
        private readonly httpReuirements: AuthHttpRequirementService,
        private readonly behaviorComm: CommunicationBehaivorService

    ) { }

    update() {
        this.httpReuirements.require(this.usersHttp.chatsHistory())
            .pipe(take(1))
            .subscribe((res) => {
                if (res) {
                    this.setSource(res)
                }
            })
    }

    setSource(data: any[]) {
        this.behaviorComm.send(ChatsHistoryService.name, { active: true, payload: data })
    }

    listen() {
        return this.behaviorComm.listen(ChatsHistoryService.name)
    }
}
import { Injectable } from "@angular/core";
import { SettingsOptions } from "../../etc/enum/settings.enum";
import { UserDto } from "../../dto/user.dto";
import { AuthHttpRequirementService } from "../http/auth.http.requirements.service";
import { UsersHttpService } from "../http/users.http.service";
import { BehaviorSubject } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";
import { CommunicationBehaivorService } from "../communication/communication.behaivor.service";
import { ChatsHistoryService } from "./chats.service";

@Injectable({
    providedIn: 'root'
})
export class MeService {


    constructor(
        private readonly usersHttp: UsersHttpService,
        private readonly httpReuirements: AuthHttpRequirementService,
        private readonly behaviorComm: CommunicationBehaivorService
    ) { }

    update() {
        this.httpReuirements.require(this.usersHttp.profile())
            .subscribe((res: (UserDto | HttpErrorResponse)) => {
                if (res) {
                    if ("error" in res) {
                    }
                    else {
                        this.setSource(res)
                        // this.#behaiverSubject.next(res)
                    }
                }
            })
    }
    setSource(data: UserDto) {
        this.behaviorComm.send(MeService.name, { active: true, payload: data })
    }

    // setUnsafe(user: UserDto) {
    //     this.#behaiverSubject.next(user)
    // }

    // #behaiverSubject: BehaviorSubject<any> = new BehaviorSubject([])

    // listen() {
    //     return this.#behaiverSubject.asObservable()
    // }
    listen() {
        return this.behaviorComm.listen(MeService.name)
        // return this.#behaiverSubject.asObservable()
    }
}
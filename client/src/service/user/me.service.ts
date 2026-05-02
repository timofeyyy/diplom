import { Injectable } from "@angular/core";
import { UserDto } from "../../dto/user.dto";
import { RefreshHttpService } from "../http/refresh.service";
import { UsersHttpService } from "../http/users.http.service";
import { HttpErrorResponse } from "@angular/common/http";
import { CommunicationReplayService } from "../communication/communication.replay.service";

@Injectable({
    providedIn: 'root'
})
export class MeService {
    constructor(
        private readonly usersHttp: UsersHttpService,
        private readonly refreshHttpService: RefreshHttpService,
        private readonly replayComm: CommunicationReplayService
    ) { }

    update() {
        this.refreshHttpService.require(this.usersHttp.profile())
            .subscribe((res: (UserDto | HttpErrorResponse)) => {
                if (res) {
                    if ("error" in res) {
                    }
                    else {
                        this.setSource(res)
                    }
                }
            })
    }
    setSource(data: UserDto) {
        this.replayComm.send(MeService.name, data)
    }

    listen() {
        return this.replayComm.listen(MeService.name)
    }
}
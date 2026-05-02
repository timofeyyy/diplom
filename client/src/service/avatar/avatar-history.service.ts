import { Injectable } from "@angular/core";
import { UserDto } from "../../dto/user.dto";
import { RefreshHttpService } from "../http/refresh.service";
import { HttpErrorResponse } from "@angular/common/http";
import { CommunicationBehaivorService } from "../communication/communication.behaivor.service";
import { AvatarHistoryHttpService } from "../http/avatar-history.http.service";

@Injectable({
    providedIn: 'root'
})
export class AvatarHistoryService {
    constructor(
        private readonly avatarHistoryHttpService: AvatarHistoryHttpService,
        private readonly refreshHttpService: RefreshHttpService,
        private readonly behaviorComm: CommunicationBehaivorService
    ) { }

    update() {
        this.refreshHttpService.require(this.avatarHistoryHttpService.load())
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
    setSource(data: any) {
        this.behaviorComm.send(AvatarHistoryService.name, data)
    }

    listen() {
        return this.behaviorComm.listen(AvatarHistoryService.name)
    }
}
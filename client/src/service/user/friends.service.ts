import { Injectable } from "@angular/core";
import { RefreshHttpService } from "../http/refresh.service";
import { UsersHttpService } from "../http/users.http.service";
import { take } from "rxjs";
import { CommunicationBehaivorService } from "../communication/communication.behaivor.service";
import { UserDto } from "../../dto/user.dto";
import { FriendStatusEnum } from "../../etc/enum/notification.enum";

export interface FreindRequest { receiverId: string, status: FriendStatusEnum }

@Injectable({
    providedIn: 'root'
})
export class FreindsService {

    constructor(
        private readonly usersHttp: UsersHttpService,
        private readonly refreshHttpService: RefreshHttpService,
        private readonly behaviorComm: CommunicationBehaivorService
    ) { }
 
    update(userId: string) {
        this.refreshHttpService.require(this.usersHttp.getUserFriendRequests(userId))
            .pipe(take(1))
            .subscribe((res: UserDto[]) => {
                if (res) {
                    this.behaviorComm.send(`${FreindsService.name}:${userId}`, res)
                }
            })
    }

    listen(userId: string) {
        return this.behaviorComm.listen(`${FreindsService.name}:${userId}`)
    }
}
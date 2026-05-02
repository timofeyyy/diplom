import { Injectable } from "@angular/core";
import { CommunicationService } from "../../../../../service/communication/communication.service";
import { AppEnum } from "../../../../../etc/enum/app.enum";
import { EventDto } from "../../../../../dto/event.dto";
import { SuccesEvent } from "../../result-event/succes-event/succes-event";
import { ErrorEvent } from "../../result-event/error-event/error-event";

@Injectable({
    providedIn: 'root'
})
export class EventNotifierService {
    constructor(
        private readonly comm: CommunicationService
    ) { }

    succesNotify(message: string) {
        this.comm.send(AppEnum.NOTIFICATION, {
            template: SuccesEvent,
            payload: {
                message: message
            }
        } as EventDto)
    }

    errorNotify(message: string) {
        this.comm.send(AppEnum.NOTIFICATION, {
            template: ErrorEvent,
            payload: {
                message: message
            }
        } as EventDto)
    }
}
import { Injectable } from "@angular/core";
import { CommunicationService } from "../communication/communication.service";

@Injectable()
export class TimerService {
    constructor(
        private readonly comm: CommunicationService
    ) { }
}
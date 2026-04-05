import { Injectable } from "@angular/core";
import { CommunicationBehaivorService } from "../communication/communication.behaivor.service";
import { AttachmentCloudDto, AttachmentLocalDto } from "../../dto/attachment.dto";

@Injectable({
    providedIn: 'root'
})
export class AttachmentsService {

    constructor(
        private readonly behaviorComm: CommunicationBehaivorService
    ) { }

    #data: AttachmentLocalDto[] | AttachmentCloudDto[] = []
    get data() {
        return this.#data
    }
    #message: string = ""
    get message() {
        return this.#message
    }
    set message(value: string) {
        this.#message = value
    }
    setAttachmentsSource(data: AttachmentLocalDto[] | AttachmentCloudDto[]) {
        this.#data = data
    }
    pushAttahcment(item: any) {
        this.#data.push(item)
    }
    removeAttachment(index: number) {
        console.log(this.#data)
        this.#data.splice(index, 1)
        console.log(this.#data)
    }
    send() {
        this.behaviorComm.send(AttachmentsService.name, { active: true, payload: { attachments: this.#data, message: this.message } })
    }

    listen() {
        return this.behaviorComm.listen(AttachmentsService.name)
    }
}
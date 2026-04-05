import { AttachmentCloudDto } from "./attachment.dto";

export interface MessageDto {
    chatId: string
    message: string
    senderId: string
    attachments: AttachmentCloudDto[]
    // fileKeys?: string[]
    createdAt: Date;
}
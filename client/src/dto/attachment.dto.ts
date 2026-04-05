import { AttahcmentsEnum } from "../etc/enum/attahcment.enum";

export interface AttachmentCloudDto { type: AttahcmentsEnum, uri: string } 

export interface AttachmentLocalDto { type: AttahcmentsEnum, blob: any } 
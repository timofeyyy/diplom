import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { AttachmentDto } from 'src/cloudfare-r2/dto/attachment.dto';
import { AttahcmentsEnum } from 'src/enum';
import { AttachmentSchema } from './attachment.schema';

export type MessageDocument = HydratedDocument<Message>;

@Schema()
export class Message {
  @Prop()
  chatId: string
  @Prop()
  message: string
  @Prop()
  senderId: string
  @Prop({ type: [AttachmentSchema], default: [] })
  attachments?: AttachmentDto[]
  @Prop({ default: Date.now })
  createdAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

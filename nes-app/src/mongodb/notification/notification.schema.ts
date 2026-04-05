import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { NotificationTypes } from 'src/etc/enum/notifications.enum';
import { Schema as MongooseSchema } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema()
export class Notification {
  @Prop({ default: Date.now })
  createdAt: Date;
  @Prop()
  message: string;
  @Prop()
  notificationType: NotificationTypes
  @Prop()
  recieverId: string
  @Prop({ type: MongooseSchema.Types.Mixed })
  data: any
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

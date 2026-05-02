import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { NotificationMainTypes, NotificationEventTypes, NotificationRequestTypes } from 'src/etc/enum/notifications.enum';
import { Schema as MongooseSchema } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema()
export class Notification {
  @Prop()
  userId!: string
  @Prop({ default: Date.now })
  createdAt!: Date;
  @Prop()
  notificationType!: (NotificationEventTypes | NotificationRequestTypes)
  @Prop()
  notificationMainType!: NotificationMainTypes
  @Prop({ type: MongooseSchema.Types.Mixed })
  data: any
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

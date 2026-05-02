import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as avatarHistorySchema from '../avtar-history/avatar-history.schema';
import { NotificationRequestTypes } from 'src/etc/enum/notifications.enum';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  email!: string;
  @Prop({ required: true })
  password!: string;
  @Prop()
  avatar!: string;
  @Prop()
  defaultAvatar!: string
  @Prop({
    type: {
      positionX: { type: Number, required: true },
      positionY: { type: Number, required: true },
      scale: { type: Number, required: true },
    },
    required: false,
  })
  displayAvatarSettings?: avatarHistorySchema.AvatarSettings;
  @Prop({ unique: true })
  userName!: string
  @Prop()
  birthday?: Date
  @Prop({
    type: [
      {
        receiverId: { type: String, required: true },
        status: { type: Number, enum: NotificationRequestTypes, required: true }
      }
    ],
    default: []
  })
  friendRequests?: { receiverId: string, status: NotificationRequestTypes }[]
  @Prop({
    type: {
      lastTime: { type: Date },
      show: { type: Boolean }
    }
  })
  status!: {
    lastTime: Date,
    show: boolean
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

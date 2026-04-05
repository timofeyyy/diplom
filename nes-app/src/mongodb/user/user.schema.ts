import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true, unique: true },)
  email: string;
  @Prop({ required: true })
  password: string;
  @Prop()
  avatar: string;
  @Prop({ unique: true })
  userName: string
  @Prop()
  birthday?: Date
  @Prop({default: []})
  friendRequests?: string[]

  @Prop({
    type: {
      lastTime: { type: Date },
      show: { type: Boolean },
      online: { type: Boolean }
    }
  })
  status: {
    lastTime: Date,
    show: boolean,
    online: boolean
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
export type AvatarSettings = {
  positionX: number,
  positionY: number,
  scale: number
}
export type AvatarHistoryDocument = HydratedDocument<AvatarHistory>;
export interface Avatar { uri: string, date: Date, displaySettings: AvatarSettings }

@Schema()
export class AvatarHistory {
  @Prop()
  userId!: string
  @Prop({ default: [] })
  files!: Avatar[]
}

export const AvatarHistorySchema = SchemaFactory.createForClass(AvatarHistory);

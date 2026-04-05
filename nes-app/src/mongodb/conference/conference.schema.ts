import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ConferenceDocument = HydratedDocument<Conference>;

@Schema()
export class Conference {
  @Prop()
  participants: string[];
  @Prop({default: 60})
  accesTime: number
  @Prop({default: 10})
  participantsCount: number 
  @Prop()
  createrId: string
  @Prop()
  createdAt: Date
}

export const ConferenceSchema = SchemaFactory.createForClass(Conference);

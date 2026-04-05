import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ _id: false })
export class Attachment {
  @Prop()
  type: string;

  @Prop()
  uri: string;
}

export const AttachmentSchema = SchemaFactory.createForClass(Attachment);
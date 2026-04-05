import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message } from './message.schema';
import { AttachmentDto } from 'src/cloudfare-r2/dto/attachment.dto';


@Injectable()
export class MongoMessageService {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<Message>,
  ) { }

  

  async find(chatId: string) {
    return await this.messageModel.find({chatId: chatId})
  }

  async create(body: { chatId: string, message: string, senderId: string, attachments: AttachmentDto[] | undefined }) {
    return await this.messageModel.create(body);
  }

  async delete(messageId: string) {
    return await this.messageModel.findByIdAndDelete(messageId);
  }

}


import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification } from './notification.schema';


@Injectable()
export class MongoNotificationService {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>
  ) { }

  async create(payload: Partial<Notification>) {
    return await this.notificationModel.create(payload)
  }

  async select(userId: string) {
    return await this.notificationModel.find({ userId: userId})
  }
}


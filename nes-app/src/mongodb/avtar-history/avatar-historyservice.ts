import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Avatar, AvatarHistory, AvatarSettings } from './avatar-history.schema';


@Injectable()
export class MongoAvatarHistoryService {
  constructor(
    @InjectModel(AvatarHistory.name)
    private readonly avatarHistoryModel: Model<AvatarHistory>,
  ) { }
  async getAllByUserId(userId: string): Promise<any> {
    const doc = await this.avatarHistoryModel.findOne({ userId }).lean();
    if (doc) {
      const grouped = doc.files.reduce((acc, item) => {
        const key = item.date.toLocaleDateString('ru-RU');
        if (!acc[key]) {
          acc[key] = [];
        }

        acc[key].push(item);
        return acc;
      }, {});
      return grouped
    }
    else {
      return []
    }
  }

  async exists(userId: string, file: string) {
    const doc = await this.avatarHistoryModel.findOne(
      {
        userId,
        'files.uri': { $regex: `${file}$` }
      },
      { 'files.$': 1 }
    ).lean();

    return doc?.files?.[0] ?? null;
  }


  async addAvatar(userId: string, file: string, displaySettings: AvatarSettings): Promise<Avatar[]> {
    const doc = await this.avatarHistoryModel.findOneAndUpdate(
      { userId },
      { $addToSet: { files: { uri: file, date: new Date(), displaySettings: displaySettings } } },
      { new: true, upsert: true }
    ).lean();

    return doc.files;
  }

  async updateAvatar(
    userId: string,
    file: string,
    displaySettings: AvatarSettings
  ): Promise<Avatar[]> {
    const doc = await this.avatarHistoryModel.findOneAndUpdate(
      { userId, 'files.uri': file },
      {
        $set: {
          'files.$.displaySettings': displaySettings
        },
      },
      { new: true }
    ).lean();

    return doc?.files ?? [];
  }

  async removeAvatar(userId: string, file: string): Promise<Avatar[]> {
    const doc = await this.avatarHistoryModel.findOneAndUpdate(
      { userId },
      { $pull: { files: { uri: file } } },
      { new: true }
    ).lean();

    return doc?.files ?? [];
  }
}
// https://pub-203fb2a074554628b6c39a496fe236a3.r2.dev/avatar/69e740c45a9b33f0fee11366/bold-matte-black-car-wrap.jpg
// https://pub-203fb2a074554628b6c39a496fe236a3.r2.dev/avatar/69e740c45a9b33f0fee11366/bold-matte-black-car-wrap.jpg

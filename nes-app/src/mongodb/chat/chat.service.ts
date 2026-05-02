import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Chat } from './chat.schema';
import { MongoWrapper } from '../mongo.types';
import { User } from '../user/user.schema';
import * as crypto from 'crypto';
import { MongoUserService } from '../user/user.service';



@Injectable()
export class MongoChatService {
  constructor(
    @InjectModel(Chat.name)
    private readonly chatModel: Model<Chat>,
    private readonly mongoUserService: MongoUserService
  ) { }

  async findWithAgregate(userA: MongoWrapper<User>) {
    return this.chatModel.aggregate([
      { $match: { participants: userA?._id.toString() } },
      {
        $addFields: {
          participantIds: {
            $map: {
              input: "$participants",
              as: "p",
              in: { $toObjectId: "$$p" }
            }
          }
        }
      },

      {
        $lookup: {
          from: "users",
          localField: "participantIds",
          foreignField: "_id",
          as: "participantDetails"
        }
      },

      {
        $addFields: {
          participantDetails: {
            $filter: {
              input: "$participantDetails",
              as: "user",
              cond: {
                $ne: ["$$user._id", { $toObjectId: userA?._id.toString() }]
              }
            }
          }
        }
      }
    ])
  }

  async findChatsWithDetails(userA: MongoWrapper<User>) {
    const chats = await this.findWithAgregate(userA)
    return chats.map((chat) => {
      const details = chat.participantDetails as MongoWrapper<User>[]
      const updatedDetails = details.map((detail) => {
        const status = this.mongoUserService
        .changeFriendRecord(userA, detail)
        return {
          ...detail,
          workGroup: null,
          duoChat: status
        }
      })
      return { ...chat, participantDetails: updatedDetails }
    })
  }

  async findOneById(id: string) {
    return await this.chatModel.findOne({ _id: id });
  }

  async findOneByUsers(userA: string, userB: string) {
    return await this.chatModel.findOne({
      participants: { $all: [userA, userB] },
      $expr: { $eq: [{ $size: "$participants" }, 2] }
    }) as unknown as MongoWrapper<Chat>;
  }


  async create(userA: string, userB: string) {
    try {
      return await this.chatModel.create({
        participants: [userA, userB]
      });
    }
    catch (e) {
      // console.log(e)
      return null
    }
  }


  buildChatHash(participants: string[]): string {
    return crypto
      .createHash('md5')
      .update(participants.sort().join('_'))
      .digest('hex')
      .slice(0, 24);
  }

  mock(_id: string, participants: string[]) {
    return new this.chatModel({
      _id,
      participants: participants
    });
  }

  #mockStorage: any = {}
  storeMock(mock: MongoWrapper<Chat>) {
    this.#mockStorage[mock!._id.toString()] = mock
  }

  getMockByChatId(chatId: string) {
    return this.#mockStorage[chatId]
  }

  async saveMockedAndDelete(mock: MongoWrapper<Chat>) {
    try {
      delete this.#mockStorage[mock!._id.toString()]
      return await this.chatModel.create(mock!) as unknown as MongoWrapper<Chat>;;
    }
    catch (e) {
      // console.log(e)
      return null
    }
  }
  async saveMocked(mock: MongoWrapper<Chat>) {
    try {
      return await this.chatModel.create(mock!) as unknown as MongoWrapper<Chat>;;
    }
    catch (e) {
      // console.log(e)
      return null
    }
  }

  deleteMocked(mock: MongoWrapper<Chat>) {
    delete this.#mockStorage[mock!._id.toString()]
  }



  // async updateOne(params: Partial<MongoWrapper<Chat>>, Chat: Chat) {
  //   try {
  //     return await this.chatModel.updateOne(params!, Chat)
  //   }
  //   catch {
  //     return null
  //   }
  // }

  // async findOneAndUpdate(params: Partial<MongoWrapper<Chat>>, Chat: Chat) {
  //   try {
  //     // console.log(Chat)
  //     return await this.chatModel.findOneAndUpdate(params!, Chat, { upsert: true, new: true })
  //   }
  //   catch {
  //     return null
  //   }
  // }

  // async findByRegex(ChatName: string, limit: number) {
  //   return await this.chatModel.find({
  //     ChatName: { $regex: `^${ChatName}`, $options: 'i' },
  //   },
  //     { ChatName: 1, avatar: 1, birthday: 1, email: 1, status: 1 }
  //   ).limit(limit) as MongoWrapper<Chat>[]
  // }
}


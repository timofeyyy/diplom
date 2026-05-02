import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MongoWrapper } from '../mongo.types';
import { User } from '../user/user.schema';
import * as crypto from 'crypto';
import { Conference } from './conference.schema';



@Injectable()
export class MongoConferenceService {
  constructor(
    @InjectModel(Conference.name)
    private readonly conferenceModel: Model<Conference>,
  ) { }

  

  // async findWithAgregate(userA: MongoWrapper<User>) {
  //   return this.chatModel.aggregate([

  //     { $match: { participants: userA?._id.toString() } },

  //     {
  //       $addFields: {
  //         participantIds: {
  //           $map: {
  //             input: "$participants",
  //             as: "p",
  //             in: { $toObjectId: "$$p" }
  //           }
  //         }
  //       }
  //     },

  //     {
  //       $lookup: {
  //         from: "users",
  //         localField: "participantIds",
  //         foreignField: "_id",
  //         as: "participantDetails"
  //       }
  //     },

  //     {
  //       $addFields: {
  //         participantDetails: {
  //           $filter: {
  //             input: "$participantDetails",
  //             as: "user",
  //             cond: {
  //               $ne: ["$$user._id", { $toObjectId: userA?._id.toString() }]
  //             }
  //           }
  //         }
  //       }
  //     }
  //   ])
  // }

  // async findConferencesWithDetails(userA: MongoWrapper<User>) {
  //   const chats = await this.findWithAgregate(userA)
  //   return chats.map((chat) => {
  //     const details = chat.participantDetails as MongoWrapper<User>[]
  //     const updatedDetails = details.map((detail) => {
  //       const status = this.mongoFriendService.changeFriendRecord(userA, detail)
  //       return {
  //         ...detail,
  //         workGroup: null,
  //         duoConference: status
  //       }
  //     })
  //     return { ...chat, participantDetails: updatedDetails }
  //   })
  // }

  // async findOneById(id: string) {
  //   return await this.chatModel.findOne({ _id: id });
  // }

  // async findOneByUsers(userA: string, userB: string) {
  //   return await this.chatModel.findOne({
  //     participants: { $all: [userA, userB] },
  //     $expr: { $eq: [{ $size: "$participants" }, 2] }
  //   }) as unknown as MongoWrapper<Conference>;
  // }


  async create(createrId: string) {
    try {
      return await this.conferenceModel.create({
        participants: [createrId],
        createdAt: new Date(),
        createrId: createrId
      });
    }
    catch (e) {
      return null
    }
  }


  // buildConferenceHash(participants: string[]): string {
  //   return crypto
  //     .createHash('md5')
  //     .update(participants.sort().join('_'))
  //     .digest('hex')
  //     .slice(0, 24);
  // }

  // mock(_id: string, participants: string[]) {
  //   return new this.chatModel({
  //     _id,
  //     participants: participants
  //   });
  // }

  // #mockStorage: any = {}
  // storeMock(mock: MongoWrapper<Conference>) {
  //   this.#mockStorage[mock!._id.toString()] = mock
  // }

  // getMockByConferenceId(chatId: string) {
  //   return this.#mockStorage[chatId]
  // }

  // async saveMockedAndDelete(mock: MongoWrapper<Conference>) {
  //   try {
  //     delete this.#mockStorage[mock!._id.toString()]
  //     return await this.chatModel.create(mock!) as unknown as MongoWrapper<Conference>;;
  //   }
  //   catch (e) {
  //     // console.log(e)
  //     return null
  //   }
  // }
  // async saveMocked(mock: MongoWrapper<Conference>) {
  //   try {
  //     return await this.chatModel.create(mock!) as unknown as MongoWrapper<Conference>;;
  //   }
  //   catch (e) {
  //     // console.log(e)
  //     return null
  //   }
  // }

  // deleteMocked(mock: MongoWrapper<Conference>) {
  //   delete this.#mockStorage[mock!._id.toString()]
  // }
}


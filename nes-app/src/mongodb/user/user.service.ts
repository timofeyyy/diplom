import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from './user.schema';
import { MongoWrapper } from '../mongo.types';
import { MongoFriendsService } from './friends.service';



@Injectable()
export class MongoUserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly mongoFriendService: MongoFriendsService
  ) { }

  async findOne(params: Partial<MongoWrapper<User>>) {
    return await this.userModel.findOne(params!).lean() as MongoWrapper<User> | null
  }

  async findOneById(id: string) {
    return await this.userModel.findById(id).lean() as MongoWrapper<User> | null
  }

  async insertOne(user: User) {
    try {
      return await this.userModel.insertOne(user)
    }
    catch {
      return null
    }
  }

  async updateOne(params: Partial<MongoWrapper<User>>, user: User) {
    try {
      return await this.userModel.updateOne(params!, user)
    }
    catch {
      return null
    }
  }

  async findOneAndUpdate(params: Partial<MongoWrapper<User>>, user: User) {
    try {
      return await this.userModel.findOneAndUpdate(params!, user, { upsert: true, new: true })
    }
    catch {
      return null
    }
  }

  async findByRegex(userName: string, limit: number, currentUser: MongoWrapper<User>) {
    const users = await this.userModel.find({
       _id: { $ne: currentUser?._id },
      userName: { $regex: `^${userName}`, $options: 'i' },
    },
      { userName: 1, avatar: 1, birthday: 1, email: 1, status: 1, isRelative: 1 }
    ).limit(limit) as MongoWrapper<User>[]

    return users.map(user => {
      const AhasB = currentUser!.friendRequests?.includes(user!._id.toString())
      const BhasA = user!.friendRequests?.includes(currentUser!._id.toString())

      return {
        ...(user as any).toObject(),
        isFriend: AhasB && BhasA
      }
    })
  }

  async findWithRelation(self: MongoWrapper<User>, userName: string, limit: number) {
    const users = await this.userModel.aggregate([
      {
        $match: {
          userName: { $regex: `^${userName}`, $options: "i" }
        }
      },

      {
        $limit: limit
      },

      {
        $lookup: {
          from: "chats",
          let: { otherUserId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: [self?._id.toString(), "$participants"] },
                    {
                      $in: [
                        { $toString: "$$otherUserId" },
                        "$participants"
                      ]
                    }
                  ]
                }
              }
            }
          ],
          as: "relation"
        }
      },

      {
        $addFields: {
          isRelative: { $gt: [{ $size: "$relation" }, 0] }
        }
      },
      {
        $project: {
          userName: 1,
          avatar: 1,
          birthday: 1,
          friendRequests: 1,
          email: 1,
          status: 1,
          isRelative: 1
        }
      }
    ])

    return users.map((user) => {
      const isFriend = this.mongoFriendService.changeFriendRecord(self, user)
      return { ...user, isFriend: isFriend }
    })
  }
}


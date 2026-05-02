import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from './user.schema';
import { MongoWrapper } from '../mongo.types';
import { ChatListEnum } from 'src/enum';
import { NotificationRequestTypes } from 'src/etc/enum/notifications.enum';

@Injectable()
export class MongoUserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
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
      const AhasB = currentUser?.friendRequests?.find((request) => request.receiverId == user!._id.toString());
      const BhasA = user?.friendRequests?.find((request) => request.receiverId == currentUser!._id.toString());

      return {
        ...(user as any).toObject(),
        isFriend: AhasB && BhasA
      }
    })
  }

  async findUsers(userName: string, limit: number, id: string) {
    const users = await this.userModel.aggregate([
      {
        $match: {
          userName: { $regex: `^${userName}`, $options: "i" },
          _id: { $ne: new Types.ObjectId(id) }
        }
      },
      {
        $limit: limit
      },
      {
        $project: {
          userName: 1,
          avatar: 1,
          birthday: 1,
          friendRequests: 1,
          email: 1,
          status: 1,
        }
      }
    ])

    return users.map((user) => {
      return { ...user, isFriend: ChatListEnum.FRIENDS }
    })
  }

  async selectUserFreinds(user: MongoWrapper<User>) {
    const friendsIds = user?.friendRequests?.filter((req) => req.status == NotificationRequestTypes.MUTUALLY).map((req) => req.receiverId) || []
    return await this.userModel.find({
      _id: { $in: friendsIds }
    });
  }

  async cancelFriendRequest(userId: string, opponentId: string) {
    const opponent = await this.findOneById(opponentId)
    const user = await this.findOneById(userId)
    const OpponentHasUser = opponent?.friendRequests?.find((req) => req.receiverId.toString() == userId) != null
    if (OpponentHasUser) {
      const request = user?.friendRequests?.find((req) => req.receiverId == opponentId)
      if (!request) {
        return
      }
      if (request.status == NotificationRequestTypes.MUTUALLY) {
        await this.updateFriendStatus(userId, opponentId, NotificationRequestTypes.INCOMMING)
        await this.updateFriendStatus(opponentId, userId, NotificationRequestTypes.SUBSCRIBED)
      }
      else {
        await this.deleteFriendRequest(userId, opponentId)
        await this.deleteFriendRequest(opponentId, userId)
      }
    }
    else {
      await this.deleteFriendRequest(userId, opponentId)
    }
  }

  async sendFriendRequest(userId: string, opponentId: string) {
    const opponent = await this.findOneById(opponentId)
    const user = await this.findOneById(userId)
    const OpponentHasUser = opponent?.friendRequests?.find((req) => req.receiverId.toString() == userId) != null
    if (OpponentHasUser) {
      await this.updateFriendStatus(userId, opponentId, NotificationRequestTypes.MUTUALLY)
      await this.updateFriendStatus(opponentId, userId, NotificationRequestTypes.MUTUALLY)
      return NotificationRequestTypes.MUTUALLY
    }
    else {
      await this.updateFriendStatus(userId, opponentId, NotificationRequestTypes.SUBSCRIBED)
      await this.updateFriendStatus(opponentId, userId, NotificationRequestTypes.INCOMMING)
      return NotificationRequestTypes.INCOMMING
    }
  }

  async updateFriendStatus(userId: string, opponentId: string, updatedStatus: NotificationRequestTypes | undefined) {
    const result = await this.userModel.updateOne(
      {
        _id: userId,
        "friendRequests.receiverId": opponentId
      },
      {
        $set: {
          "friendRequests.$.status": updatedStatus
        }
      }
    );

    if (result.matchedCount === 0) {
      await this.userModel.updateOne(
        { _id: userId },
        {
          $push: {
            friendRequests: {
              receiverId: opponentId,
              status: updatedStatus
            }
          }
        }
      );
    }
  }

  async deleteFriendRequest(userId: string, opponentId: string) {
    return await this.userModel.updateOne(
      { _id: userId },
      {
        $pull: {
          friendRequests: {
            receiverId: opponentId
          }
        }
      }
    );
  }

  changeFriendRecord(
    userA: MongoWrapper<User>,
    userB: MongoWrapper<User>
  ): ChatListEnum | null {
    try {
      const AhasB = userA?.friendRequests?.find((request) => request.receiverId == userA!._id.toString());
      const BhasA = userB?.friendRequests?.find((request) => request.receiverId == userB!._id.toString());

      if (AhasB && BhasA) {
        return ChatListEnum.FRIENDS;
      }

      if (AhasB) {
        return ChatListEnum.INPUT;
      }

      if (BhasA) {
        return ChatListEnum.OUTPUT;
      }

      return ChatListEnum.PEOPLE;
    } catch (error) {
      return null;
    }
  }
}


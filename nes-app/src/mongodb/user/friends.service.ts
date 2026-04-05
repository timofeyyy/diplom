import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from './user.schema';
import { MongoWrapper } from '../mongo.types';
import { ChatListEnum } from 'src/enum';

// type FriendStatus = 'input' | 'output' | 'default';


@Injectable()
export class MongoFriendsService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
  ) { }

  async sendRequest(recieverId: string, senderId: string) {
    return await this.userModel.updateOne(
      { _id: recieverId },
      { $addToSet: { friendRequests: senderId } }
    );
  }

  async removeRequest(recieverId: string, senderId: string) {
    return await this.userModel.updateOne(
      { _id: recieverId },
      { $pull: { friendRequests: senderId } }
    );
  }

  changeFriendRecord(
    userA: MongoWrapper<User>,
    userB: MongoWrapper<User>
  ): ChatListEnum | null {
    try {
      const AhasB = userA?.friendRequests?.includes(userB!._id.toString());
      const BhasA = userB?.friendRequests?.includes(userA!._id.toString());

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
  // changeFriendRecord(userA: MongoWrapper<User>, userB: MongoWrapper<User>) {
  //   try {
  //     const AhasB = userA!.friendRequests?.indexOf(userB!._id.toString())
  //     const BhasA = userB!.friendRequests?.indexOf(userA!._id.toString())
  //     return (AhasB != -1) && (BhasA != -1)

  //   } catch (error) {
  //     return false
  //   }
  // }
}
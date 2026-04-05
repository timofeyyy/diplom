import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user/user.schema';
import { MongoUserService } from './user/user.service';
import { Chat, ChatSchema } from './chat/chat.schema';
import { MongoChatService } from './chat/chat.service';
import { Message, MessageSchema } from './message/message.schema';
import { MongoMessageService } from './message/message.service';
import { MongoFriendsService } from './user/friends.service';
import { Conference, ConferenceSchema } from './conference/conference.schema';
import { MongoConferenceService } from './conference/conference.service';
import { Notification, NotificationSchema } from './notification/notification.schema';
import { MongoNotificationService } from './notification/notification.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
    ]),
    MongooseModule.forFeature([
      { name: Chat.name, schema: ChatSchema },
    ]),
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
    ]),
    MongooseModule.forFeature([
      { name: Conference.name, schema: ConferenceSchema },
    ]),
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],
  controllers: [],
  providers: [
    MongoUserService,
    MongoChatService,
    MongoMessageService,
    MongoFriendsService,
    MongoConferenceService,
    MongoNotificationService
  ],
  exports: [
    MongoUserService,
    MongoChatService,
    MongoMessageService,
    MongoFriendsService,
    MongoConferenceService,
    MongoNotificationService
  ]
})
export class MongoDbModule { }
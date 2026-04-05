import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from '@nestjs/websockets';
import { SocketService } from './socket.service';
import { Server, Socket } from 'socket.io'
import jwt from 'jsonwebtoken';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Res, UnauthorizedException, BadRequestException, ConflictException, HttpStatus, NotFoundException, Logger } from '@nestjs/common';
import * as cookie from 'cookie';
import { TokenType } from 'src/auth/dto/user.dto';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { MongoChatService } from 'src/mongodb/chat/chat.service';
import { MongoWrapper } from 'src/mongodb/mongo.types';
import { User } from 'src/mongodb/user/user.schema';
import { UserStatusStorageService } from 'src/user/user.status.storage.service';
import { MongoMessageService } from 'src/mongodb/message/message.service';
import { MongoUserService } from 'src/mongodb/user/user.service';
import { MongoFriendsService } from 'src/mongodb/user/friends.service';
import { ObjectId } from 'mongoose';

@WebSocketGateway({
  path: '/main',
  cors: {
    origin: '*',

  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly socketService: SocketService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly mongoChatService: MongoChatService,
    private readonly userStatusStorageService: UserStatusStorageService,
    private readonly mongoMessage: MongoMessageService,
    private readonly mongoUsersService: MongoUserService,
    private readonly mongoFriendsService: MongoFriendsService,
  ) { }

  private logger = new Logger(SocketGateway.name)

  async handleDisconnect(client: Socket) {
    const userId = (client as any).userId as string
    const actualUser = await this.mongoUsersService.findOneById(userId)
    this.logger.debug("handleDisconnect", actualUser, userId)
    const result = await this.mongoChatService.findChatsWithDetails(actualUser!)
    if (result) {
      for (const item of result) {
        const otherUser = item.participantDetails[0]
        const chatId = item._id.toString()
        console.log(`notify ${otherUser?.userName} about user ${actualUser!.userName} disconnecting ${chatId}"\tchatid=${chatId}`)
        this.userStatusStorageService.setActivityStatus(client, false)
        const record = this.userStatusStorageService.getRecord(userId)
        this.server.to(chatId).emit("user-offline", userId, {
          online: record?.online,
          date: record?.date
        });
      }
    }
    this.userStatusStorageService.setActivityStatus(client, false)
  }
  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    this.logger.debug("handleConnection")
    let userId;
    try {
      const cookies = client.handshake.headers.cookie;
      console.log(cookies)
      let token = cookie.parse(cookies)[TokenType.ACCES_TOKEN]
      const payload: any = jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
      userId = payload._id
      const user = await this.authService.getUser({ _id: userId })
      if (!user) {
        throw new Error()
      }
      (client as any).userId = userId;

      const result = await this.mongoChatService.findChatsWithDetails(user)
      const statusRecords = {}
      if (result) {
        for (const item of result) {
          const otherUser: MongoWrapper<User> = item.participantDetails[0]
          const chatId = item._id.toString()
          const otherUserId = otherUser!._id.toString()
          let record = this.userStatusStorageService.getRecord(otherUserId)
          if (!record) {
            this.userStatusStorageService.setActivityStatus(client, undefined)
            record = this.userStatusStorageService.getRecord(otherUserId)
          }
          statusRecords[otherUserId] = {
            online: record?.online,
            date: record?.date
          }
          console.log(`notify ${otherUser?.userName} about user ${user.userName} connected ${chatId}\tchatid=${chatId}`)
          this.server.to(chatId).emit("user-online", userId, {
            online: record?.online,
            date: record?.date
          });
          // client.join(chatId);
        }
      }
      this.userStatusStorageService.setActivityStatus(client, true)
      client.emit('load-other-user-status', statusRecords)
    }
    catch (e) {

      console.log(e)
      console.log("disconnect")
      if (userId) {
        this.userStatusStorageService.setActivityStatus(client, false)
      }
      client.disconnect()
    }
  }


  @SubscribeMessage('receiver-status-update')
  async receiverStatusUpdate(
    @MessageBody() payload: { recieverId: any, chatId: string, del: boolean },
    @ConnectedSocket() client: Socket
  ) {
    const senderId = (client as any).userId as string
    if (payload.del) {
      await this.mongoFriendsService.removeRequest(payload.recieverId.toString(), senderId)
    }
    else {
      await this.mongoFriendsService.sendRequest(payload.recieverId.toString(), senderId)
    }
    let result = await this.mongoChatService.findOneById(payload.chatId)
    if (!result) {
      const mock = this.mongoChatService.getMockByChatId(payload.chatId)
      await this.mongoChatService.saveMockedAndDelete(mock)
      // client.to(payload.chatId).emit('chat-list-update')
    }
    const reciever = await this.mongoUsersService.findOne({ _id: payload.recieverId })

    const recieverRecord = this.userStatusStorageService.getRecord(payload.recieverId)
    if (recieverRecord && recieverRecord.online) {
      const socket = recieverRecord.socket
      socket.emit("profile-update", reciever)
    }
    this.server.to(payload.chatId).emit("chat-list-update")
  }

  @SubscribeMessage('sender-status-update')
  async senderStatusUpdate(
    @MessageBody() payload: { recieverId: any, chatId: string, del: boolean },
    @ConnectedSocket() client: Socket
  ) {
    // this.logger.debug(SocketGateway.name, payload)
    const senderId = (client as any).userId as string

    if (payload.del) {
      await this.mongoFriendsService.removeRequest(senderId, payload.recieverId.toString())
    }
    else {
      await this.mongoFriendsService.sendRequest(senderId, payload.recieverId.toString())
    }

    const actualUser = await this.mongoUsersService.findOneById(senderId)
    // this.logger.debug(actualUser)
    client.emit("profile-update", actualUser)
    // client.emit("chat-list-update")
    const recieverRecord = this.userStatusStorageService.getRecord(payload.recieverId)
    if (recieverRecord && recieverRecord.online) {
      const socket = recieverRecord.socket
      socket.emit("chat-list-update")
    }
    this.server.to(payload.chatId).emit("chat-list-update")

  }


  @SubscribeMessage('join-chat')
  async joinChat(
    @MessageBody() receiverId: string,
    @ConnectedSocket() client: Socket
  ) {
    // this.logger.debug("\n\n\n\n\n\n\n\n\n\n")
    const userId = (client as any).userId as string
    const chatId = this.mongoChatService.buildChatHash([userId, receiverId]);
    // this.logger.debug(chatId)
    let result = await this.mongoChatService.findOneById(chatId);

    if (!result) {
      result = this.mongoChatService.getMockByChatId(chatId)
      if (!result) {
        result = this.mongoChatService.mock(chatId, [userId, receiverId]);
        this.mongoChatService.storeMock(result)
      }
    }
    client.join(chatId);
    client.emit('chat-joined', chatId);
    const record = this.userStatusStorageService.getRecord(receiverId)
    // console.log(record)
    // this.logger.debug({ controller: SocketGateway.name, method: "joinChat", data: { chatId: chatId, receiverId: receiverId } })

    if (record) {
      client.emit("user-online", receiverId, {
        online: record?.online,
        date: record?.date
      });
      record.socket.join(chatId)
      record.socket.emit('chat-joined', chatId);

      record.socket.emit("user-online", userId, {
        online: record?.online,
        date: record?.date
      });
    }
  }

  @SubscribeMessage('send-message')
  async makeBound(
    @MessageBody() body: any,
    @ConnectedSocket() client: Socket
  ) {
    const senderId = (client as any).userId
    const { message, chatId } = body
    // this.logger.debug({ controller: SocketGateway.name, method: "makeBound", data: body })

    // let result = await this.mongoChatService.findOneById(chatId)
    // if (!result) {
    const mock = this.mongoChatService.getMockByChatId(chatId)
    if (mock) {
      this.mongoChatService.deleteMocked(mock)
      this.server.to(chatId).emit('chat-list-update')
    }
    // }

    // await this.mongoMessage.create({ chatId: chatId, senderId: senderId, message: message })
    this.server.to(chatId).emit(
      'message-recieve',
      // senderId,
      // message
      body
    );
  }

  @SubscribeMessage('load-messages')
  async loadMessages(
    @MessageBody() chatId: string,
    @ConnectedSocket() client: Socket
  ) {
    // this.logger.debug({ controller: SocketGateway.name, method: "loadMessages", data: chatId })
    const messages = await this.mongoMessage.find(chatId)
    client.emit(
      'load-messages',
      messages
    );
  }

  // @SubscribeMessage('join-vide-room')
  // joinRoom(
  //   @MessageBody() data: any,
  //   @ConnectedSocket() client: Socket,
  // ) {
  //   const [roomId] = data
  //   this.socketService.joinRoom(client, roomId, userId, userName)
  // }

  // @SubscribeMessage('get-user-data')
  // getUserData(
  //   @MessageBody() data: any,
  //   @ConnectedSocket() client: Socket,
  // ) {
  //   console.log(data)
  //   console.log('get-user-data')
  //   const [roomId, userId] = data
  //   return this.socketService.getUserData(roomId, userId)
  // }

  // @SubscribeMessage('user-disconnected')
  // userDisonnected(
  //   @MessageBody() data: any,
  //   @ConnectedSocket() client: Socket,
  // ) {
  //   const [roomId, userId] = data
  //   this.socketService.userDisonnected(client, roomId, userId)
  // }
}

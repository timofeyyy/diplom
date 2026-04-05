import { BadRequestException, Body, Controller, Get, Logger, NotFoundException, Param, Post, Req, Res, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAccessGuard } from 'src/auth/guards/jwt.acces.guard';
import { UserCookiesGuard } from 'src/auth/guards/user.cookies.guard';
import { MongoChatService } from 'src/mongodb/chat/chat.service';
import { MongoFriendsService } from 'src/mongodb/user/friends.service';
import { MongoUserService } from 'src/mongodb/user/user.service';
import { UserStatusStorageService } from './user.status.storage.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FileStorageService } from 'src/cloudfare-r2/file.storage.service';
import { MongoMessageService } from 'src/mongodb/message/message.service';
import { RedisConferenceService } from 'src/redis/redis.conference.service';
import { MongoConferenceService } from 'src/mongodb/conference/conference.service';
import { AttachmentDto } from 'src/cloudfare-r2/dto/attachment.dto';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly mongoChatService: MongoChatService,
    private readonly mongoFriendsService: MongoFriendsService,
    private readonly mongoUsersService: MongoUserService,
    private readonly userStatusStorageService: UserStatusStorageService,
    private readonly fileStorageServie: FileStorageService,
    private readonly mongoMessageService: MongoMessageService,
    private readonly redisConferenceService: RedisConferenceService,
    private readonly mongoConferenceService: MongoConferenceService
  ) { }

  logger = new Logger(UserController.name)

  @UseGuards(
    JwtAccessGuard,
    UserCookiesGuard
  )
  @Get("search/:regex")
  async search(@Param("regex") regex: string, @Req() req) {
    if (regex) {
      const user = req.user
      return await this.mongoUsersService.findWithRelation(user, regex, 20)
    }
    throw new BadRequestException()
  }

  @Get("monitoring")
  monitoringStat() {
    return this.userStatusStorageService.monitore()
  }


  @UseGuards(
    JwtAccessGuard,
    UserCookiesGuard
  )
  @Post("update/:param")
  async update(@Param("param") param, @Body() body, @Req() req) {
    const value = body[param]
    const user = req.user
    let message: string | null = "invalid"
    if (value != undefined) {
      let result = this.userService.validate(param, value)
      if (result === undefined) {
        message = "Not existed param"
      }
      else if (!result) {
        return await this.userService.upd(param, value, user)
      }
    }
    throw new BadRequestException(message)
  }

  @UseGuards(
    JwtAccessGuard,
    UserCookiesGuard
  )
  @Post("friendRequest/send")
  async sendFriendRequest(@Req() req, @Body() body) {
    const recieverId = body.recieverId
    const reciever = await this.mongoUsersService.findOne({ _id: recieverId.toString() })
    if (reciever) {
      const sender = req.user
      return await this.mongoFriendsService.sendRequest(recieverId.toString(), sender._id.toString())
    }
    return new NotFoundException()
  }

  @UseGuards(
    JwtAccessGuard,
    UserCookiesGuard
  )
  @Get('chat-exists/:opponentId')
  async chatExists(@Param('opponentId') opponentId, @Req() req) {
    const user = req.user
    return await this.mongoChatService.findOneByUsers(user._id.toString(), opponentId)
  }


  @UseGuards(
    JwtAccessGuard,
    UserCookiesGuard
  )
  @Post('send-message')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFiles(
    @Req() req,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: any
  ) {
    const user = req.user
    const { message, chatId, types } = body;
    const attachments: AttachmentDto[] = []
    const promises = files.map(async (file, index) => {
      const key = await this.fileStorageServie.uploadFile(file, `chats/${chatId}`);
      attachments.push({ type: types[index], uri: key})
    });
    await Promise.all(promises);
    let result = await this.mongoChatService.findOneById(chatId) as any
    if (!result || !result.length) {
      const mock = this.mongoChatService.getMockByChatId(chatId)
      await this.mongoChatService.saveMocked(mock)
    }
    return await this.mongoMessageService.create({ chatId: chatId, senderId: user._id.toString(), message: message, attachments: attachments })
  }

  @UseGuards(
    JwtAccessGuard,
    UserCookiesGuard
  )
  @Post("friendRequest/remove")
  async removeFriendRequest(@Req() req, @Body() body) {
    const recieverId = body.recieverId
    const reciever = await this.mongoUsersService.findOne({ _id: recieverId.toString() })
    if (reciever) {
      const sender = req.user
      return await this.mongoFriendsService.removeRequest(recieverId.toString(), sender._id.toString())
    }
    return new NotFoundException()
  }


  @UseGuards(
    JwtAccessGuard,
    UserCookiesGuard
  )
  @Get("chats/history")
  async history(@Req() req) {
    const user = req.user
    return await this.mongoChatService.findChatsWithDetails(user)
  }

  @UseGuards(
    JwtAccessGuard,
    UserCookiesGuard
  )
  @Get('profile')
  async profile(@Req() req, @Res({ passthrough: true }) res) {
    return req.user
  }

  @UseGuards(
    JwtAccessGuard,
    UserCookiesGuard
  )
  @Post('create-video-room')
  async createVideoRoom(
    @Req() req
  ) {
    const user = req.user
    const conference = await this.mongoConferenceService.create(user._id.toString())
    await this.redisConferenceService.create(conference?._id.toString()!, 10)
  }
}



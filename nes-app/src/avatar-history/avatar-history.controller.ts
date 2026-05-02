import { BadRequestException, Body, Controller, Delete, Get, Logger, NotFoundException, Param, Post, Put, Req, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { MongoWrapper } from 'src/mongodb/mongo.types';
import { User } from 'src/mongodb/user/user.schema';
import { MongoAvatarHistoryService } from 'src/mongodb/avtar-history/avatar-historyservice';
import { FileStorageService } from 'src/cloudfare-r2/file.storage.service';
import { JwtAccessGuard } from 'src/auth/guards/jwt.acces.guard';
import { UserCookiesGuard } from 'src/auth/guards/user.cookies.guard';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { BucketNamesEnum } from 'src/enum';

@Controller('avatar-history')
export class AvatarHistoryController {
  constructor(
    private readonly mongoAvatarHistoryService: MongoAvatarHistoryService,
    private readonly fileStorageServie: FileStorageService
  ) { }

  logger = new Logger(AvatarHistoryController.name)

  @UseGuards(
    JwtAccessGuard,
    UserCookiesGuard
  )
  @Get('load')
  async select(
    @Req() req
  ) {
    const user = req.user as MongoWrapper<User>
    return this.mongoAvatarHistoryService.getAllByUserId(user!._id.toString())
  }

  @UseGuards(
    JwtAccessGuard,
    UserCookiesGuard
  )
  @UseInterceptors(FileInterceptor('file'))
  @Post('add')
  async add(
    @Req() req,
    @Body() body,
    @UploadedFile() file: Express.Multer.File
  ) {
    const user = req.user as MongoWrapper<User>
    const userId = user!._id.toString()
    const displaySettings = JSON.parse(body.displaySettings)
    if (!file && !displaySettings) {
      throw new BadRequestException()
    }
    const targetKey = `avatar/${userId}/${file.originalname}`;
    const uri = process.env.S3_CLOUD_BASE_URL + targetKey
    const exists = await this.mongoAvatarHistoryService.exists(userId, uri)
    if (exists) {
      throw new BadRequestException()
    }
    const key = await this.fileStorageServie.uploadFile(file, `avatar/${user!._id.toString()}`);
    return this.mongoAvatarHistoryService.addAvatar(userId, key, displaySettings)
  }

  @UseGuards(
    JwtAccessGuard,
    UserCookiesGuard
  )
  @Put('edit/:filename')
  async edit(
    @Req() req,
    @Body() body,
    @Param("filename") filename
  ) {
    const user = req.user as MongoWrapper<User>
    const userId = user!._id.toString()
    const displaySettings = body.displaySettings
    const targetKey = `avatar/${user?._id.toString()}/${filename}`;
    const uri = process.env.S3_CLOUD_BASE_URL + targetKey
    if (!filename && !displaySettings) {
      throw new BadRequestException()
    }
    return await this.mongoAvatarHistoryService.updateAvatar(userId, uri, displaySettings);
  }

  @UseGuards(
    JwtAccessGuard,
    UserCookiesGuard
  )
  @Delete('remove/:filename')
  async remove(
    @Req() req,
    @Param("filename") filename
  ) {
    const user = req.user as MongoWrapper<User>
    const targetKey = `avatar/${user?._id.toString()}/${filename}`;
    const uri = process.env.S3_CLOUD_BASE_URL + targetKey
    // console.log(uri)
    if (!filename) {
      throw new BadRequestException()
    }
    await this.fileStorageServie.removeFile(targetKey);
    return this.mongoAvatarHistoryService.removeAvatar(user!._id.toString(), uri)
  }
}



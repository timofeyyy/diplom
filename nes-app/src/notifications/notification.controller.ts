import { Controller, UseGuards, Post, Req, Body, Get, Logger } from "@nestjs/common"
import { JwtAccessGuard } from "src/auth/guards/jwt.acces.guard"
import { UserCookiesGuard } from "src/auth/guards/user.cookies.guard"
import { NotificationService } from "./notification.service"
import { MongoNotificationService } from "src/mongodb/notification/notification.service"

@Controller('api-notifications')
export class NotificationsController {
  constructor(
    private readonly mongoNotificationService: MongoNotificationService,
    private readonly notificationService: NotificationService

  ) { }

  logger = new Logger(NotificationsController.name)

  @UseGuards(
    JwtAccessGuard,
    UserCookiesGuard
  )
  @Post('send')
  async send(
    @Req() req,
    @Body() body: any
  ) {

    const message = this.notificationService.buildNotification(body)
    return await this.mongoNotificationService.create({ ...body, message: message! })
  }

   @UseGuards(
    JwtAccessGuard,
    UserCookiesGuard
  )
  @Get('select')
  async select(
    @Req() req,
  ) {
    const userId = req.user._id.toString()
    this.logger.debug(userId)
    return await this.mongoNotificationService.select(userId)
  }

}

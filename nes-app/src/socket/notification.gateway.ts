import { OnGatewayConnection, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io'
import jwt from 'jsonwebtoken';
import { Logger } from '@nestjs/common';
import * as cookie from 'cookie';
import { TokenType } from 'src/auth/dto/user.dto';
import { AuthService } from 'src/auth/auth.service';
import { NotificationService } from 'src/notifications/notification.service';
import { MongoNotificationService } from 'src/mongodb/notification/notification.service';
import { Console } from 'node:console';

@WebSocketGateway({
  path: '/notifications',
  cors: {
    origin: '*',
  },
})
export class SocketNotificationGateway implements OnGatewayConnection {
  constructor(
    private readonly authService: AuthService,
    private readonly notificationService: NotificationService,
    private readonly mongoNotificationService: MongoNotificationService,
  ) { }

  private logger = new Logger(SocketNotificationGateway.name)

  @WebSocketServer()
  server!: Server;

  async handleConnection(client: Socket) {
    this.logger.debug("handleConnection")
    let userId;
    try {
      const cookies = client.handshake.headers.cookie;
      let token = cookie.parse(cookies)[TokenType.ACCES_TOKEN]
      const payload: any = jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
      userId = payload._id
      const user = await this.authService.getUser({ _id: userId })
      if (!user) {
        throw new Error()
      }
      (client as any).userId = userId;
      client.join(`userId:${userId}`)
      this.notificationService.listen(userId).subscribe((res) => {
        client.emit('notification-receive', res)
        console.log(userId+":notification")
      })
    }
    catch (e) {
      this.logger.debug("disconnect")
      client.disconnect()
    }
  }

  // @SubscribeMessage('notification-send')
  // async sendNotification(
  //   @MessageBody() payload: { recieverId: any, notificationType: NotificationTypes, data: any },
  // ) {
  //   // console.log("notification-recieved", payload.recieverId)
  //   const message = this.notificationService.buildNotification(payload)
  //   const res = await this.mongoNotificationService.create({ ...payload, message: message })
  //   this.server.to(`userId:${payload.recieverId}`).emit("notification-recieved", res)
  // }
}

import { Module } from '@nestjs/common';
import { SocketModule } from './socket/socket.module';
import { RedisModule } from './redis/redis.module';
// import { RedisAuthService } from './redis/redis.auth.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
// import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoDbModule } from './mongodb/mongo.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { UserModule } from './user/user.module';
import { NotificationModule } from './notifications/notification.module';
import { AvatarHistoryModule } from './avatar-history/avatar-history.module';
import { CommunicationModule } from './etc/service/communication.modulte';

@Module({
  imports: [
    ConfigModule.forRoot(),
    RedisModule.forRoot(process.env.CONN_REDIS!),
    MongooseModule.forRoot(process.env.CONN_MONGO_DB!),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.PASS,
        },
      },
    }),
    CommunicationModule,
    AuthModule,
    UserModule,
    SocketModule,
    NotificationModule,
    AvatarHistoryModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }

import { Module } from '@nestjs/common';
import { SocketService } from './socket.service';
import { SocketGateway } from './socket.gateway';
// import { RedisAuthService } from 'src/redis/redis.auth.service';
import { AuthService } from 'src/auth/auth.service';
import { AuthModule } from 'src/auth/auth.module';
import { UserService } from 'src/user/user.service';
import { UserModule } from 'src/user/user.module';
import { JwtService } from '@nestjs/jwt';
import { MongoDbModule } from 'src/mongodb/mongo.module';
import { NotificationService } from 'src/notifications/notification.service';
import { SocketNotificationGateway } from './notification.gateway';
import { SocketConferenceGateway } from './conference.gateway';

@Module({
  imports: [AuthModule, UserModule, MongoDbModule],
  providers: [SocketGateway, SocketNotificationGateway, SocketConferenceGateway, SocketService, JwtService, NotificationService],
})
export class SocketModule {}

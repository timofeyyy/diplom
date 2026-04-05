import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
// import { RedisAuthService } from 'src/redis/redis.auth.service';
// import { UsersModule } from 'src/users/users.module';
import { JwtModule, JwtService } from '@nestjs/jwt';

import { RedisTokenService } from 'src/redis/redis.token.service';
import { MongoDbModule } from 'src/mongodb/mongo.module';
import { JwtRefreshStrategy } from 'src/auth/strategy/jwt.refresh.strategy';
import { JwtAccessStrategy } from 'src/auth/strategy/jwt.acces.strategy';
import { AuthService } from 'src/auth/auth.service';
import { EncryptionService } from 'src/auth/encryption.service';
import { GoogleAuthGuard } from 'src/auth/guards/google.guard';
import { GoogleStrategy } from 'src/auth/strategy/google.strategy';
import { LocalStrategy } from 'src/auth/strategy/local.strategy';
import { NotificationsController } from './notification.controller';
import { AuthModule } from 'src/auth/auth.module';
import { NotificationService } from './notification.service';
@Module({
  imports: [
    MongoDbModule,
    AuthModule
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationService
  ],
  exports: [
    NotificationService
  ]
})

export class NotificationModule { }

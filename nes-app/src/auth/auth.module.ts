import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigService } from '@nestjs/config';
import { GoogleAuthGuard } from './guards/google.guard';
import { GoogleStrategy } from './strategy/google.strategy';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategy/local.strategy';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtRefreshStrategy } from './strategy/jwt.refresh.strategy';
import { JwtAccessStrategy } from './strategy/jwt.acces.strategy';
import { RedisTokenService } from 'src/redis/redis.token.service';
import { MongoDbModule } from 'src/mongodb/mongo.module';
import { EncryptionService } from './encryption.service';
import { MailModule } from './../mailer/mailer.module';
import { NotificationService } from 'src/notifications/notification.service';
@Module({
  imports: [
    PassportModule.register({ session: false }),
    MongoDbModule,
    JwtModule.register({}),
    MailModule
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    RedisTokenService,
    EncryptionService,
    
    ConfigService,
    GoogleAuthGuard,
    GoogleStrategy,
    LocalStrategy,
    JwtService,
    JwtRefreshStrategy,
    JwtAccessStrategy,
    // CommunicationService,
    // CommunicationBehaivorService,
    NotificationService,

  ],
  exports: [
    AuthService,
    RedisTokenService,
    EncryptionService,
    // CommunicationService,
    // CommunicationBehaivorService,
    NotificationService
  ]
})

export class AuthModule { }

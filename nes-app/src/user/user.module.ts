import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongoDbModule } from 'src/mongodb/mongo.module';
import { JwtAccessStrategy } from 'src/auth/strategy/jwt.acces.strategy';
import { UserCookiesGuard } from 'src/auth/guards/user.cookies.guard';
import { AuthService } from 'src/auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { EncryptionService } from 'src/auth/encryption.service';
import { RedisTokenService } from 'src/redis/redis.token.service';
import { AuthModule } from 'src/auth/auth.module';
import { UserStatusStorageService } from './user.status.storage.service';
import { FileStorageService } from 'src/cloudfare-r2/file.storage.service';
import { RedisConferenceService } from 'src/redis/redis.conference.service';

@Module({
  imports: [MongoDbModule, AuthModule],
  controllers: [UserController],
  providers: [
    UserService,
    UserStatusStorageService,
    FileStorageService,
    RedisConferenceService
  ],
  exports: [UserService, UserStatusStorageService, FileStorageService] 
})
export class UserModule {}

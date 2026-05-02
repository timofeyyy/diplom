import { Module } from '@nestjs/common';
import { MongoDbModule } from 'src/mongodb/mongo.module';
import { AuthModule } from 'src/auth/auth.module';
import { FileStorageService } from 'src/cloudfare-r2/file.storage.service';
import { AvatarHistoryController } from './avatar-history.controller';

@Module({
  imports: [MongoDbModule, AuthModule],
  controllers: [AvatarHistoryController],
  providers: [
    FileStorageService,
  ],
  exports: [FileStorageService] 
})
export class AvatarHistoryModule {}

import { Injectable } from '@nestjs/common';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3 } from './s3';

@Injectable()
export class FileStorageService {
  private bucketName = 'chat-media';

  async uploadFile(file: Express.Multer.File, path: string) {
    const key = `${path}/${Date.now()}-${file.originalname}`;
    console.log(key)
    await s3.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );

    return `https://pub-203fb2a074554628b6c39a496fe236a3.r2.dev/${key}`;
  }
}
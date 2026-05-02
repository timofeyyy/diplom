import { Injectable } from '@nestjs/common';
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { s3 } from './s3';

@Injectable()
export class FileStorageService {

  async uploadFile(file: Express.Multer.File, path: string) {
    const key = `${path}/${file.originalname}`;
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );

    return `${process.env.S3_CLOUD_BASE_URL}${key}`;
  }

  async removeFile(fileUrl: string) {
    const key = fileUrl.replace(process.env.S3_CLOUD_BASE_URL!, '');
    // console.log(key)
    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.BUCKET_NAME,
        Key: key,
      })
    );

    return true;
  }
}
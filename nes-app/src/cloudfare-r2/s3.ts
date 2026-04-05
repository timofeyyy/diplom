import { S3Client } from '@aws-sdk/client-s3';

export const s3 = new S3Client({
  region: 'auto',
  endpoint: 'https://bec80f6cf3101b68c3c0c646bc02ba4b.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: '121d958f6103c4ddb4a3e210ae434ff8',
    secretAccessKey: 'f45307c68546a73f97c99e3eaa5f9e825bef9a9bc38d3df73a677b5621f30fc2',
  },
});
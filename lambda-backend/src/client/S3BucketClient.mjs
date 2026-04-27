// S3BucketClient.mjs
import { S3Client } from '@aws-sdk/client-s3';

const region = process.env.AWS_REGION ?? process.env.MY_AWS_REGION;
if (!region) throw new Error("Missing environment variable: AWS_REGION or MY_AWS_REGION");

const credentials = process.env.AWS_ACCESS_KEY_ID ? {
  accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  ...(process.env.AWS_SESSION_TOKEN
    ? { sessionToken: process.env.AWS_SESSION_TOKEN }
    : {}),
} : undefined;

export const s3 = new S3Client({ 
  region, 
  credentials,
  forcePathStyle: true,
});

// src/client/SESClient.mjs
import { SESClient } from '@aws-sdk/client-ses';


const region = process.env.AWS_REGION;
if (!region) throw new Error("Missing environment variable: AWS_REGION");

const credentials = process.env.AWS_ACCESS_KEY_ID ? {
  accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  ...(process.env.AWS_SESSION_TOKEN
    ? { sessionToken: process.env.AWS_SESSION_TOKEN }
    : {}),
} : undefined;

export const ses = new SESClient({ region, credentials });
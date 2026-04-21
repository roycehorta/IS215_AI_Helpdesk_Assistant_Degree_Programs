// DynamoDBClient.mjs
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

const region = process.env.AWS_REGION;
if (!region) throw new Error("Missing environment variable: AWS_REGION");

const credentials = process.env.AWS_ACCESS_KEY_ID ? {
  accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken:    process.env.AWS_SESSION_TOKEN,
} : undefined;

export const dynamo = new DynamoDBClient({ region, credentials });
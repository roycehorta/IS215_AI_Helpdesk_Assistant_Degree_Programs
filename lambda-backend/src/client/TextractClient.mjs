// src/client/TextractClient.mjs
import { TextractClient } from "@aws-sdk/client-textract";

const region = process.env.AWS_REGION;
if (!region) throw new Error("Missing environment variable: AWS_REGION");

const credentials = process.env.AWS_ACCESS_KEY_ID ? {
  accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  sessionToken:    process.env.AWS_SESSION_TOKEN,
} : undefined;

export const textract = new TextractClient({ region, credentials });
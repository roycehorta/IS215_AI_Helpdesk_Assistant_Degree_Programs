// local-client-conn-tester.mjs
import { ListBucketsCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import 'dotenv/config';
import { s3 } from './src/client/S3BucketClient.mjs';

const HEADER = (label) => {
  console.log(`\n${"═".repeat(52)}`);
  console.log(`  ${label}`);
  console.log("═".repeat(52));
};
const pass = (msg) => console.log(`  ✅ ${msg}`);
const fail = (msg) => console.error(`  ❌ ${msg}`);
const info = (msg) => console.log(`  ℹ️  ${msg}`);

// ── 1. ENV CHECK ──────────────────────────────────────────────────────────────
HEADER("STEP 1 — Environment Variables");

const REQUIRED_VARS = [
  "AWS_REGION",
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  // "AWS_SESSION_TOKEN", ← removed, free tier doesn't need this
  "S3_BUCKET_NAME",
  "OPENAI_ENDPOINT",
  "OPENAI_API_KEY",
  "OPENAI_MODEL",
];

let envOk = true;
for (const key of REQUIRED_VARS) {
  if (process.env[key]) {
    pass(`${key} is set`);
  } else {
    fail(`${key} is MISSING`);
    envOk = false;
  }
}

if (!envOk) {
  console.error("\n💥 Fix missing .env variables before proceeding.\n");
  process.exit(1);
}

// ── 2. S3 CONNECTION ──────────────────────────────────────────────────────────
HEADER("STEP 2 — S3 Connection");

try {
  const bucketsRes  = await s3.send(new ListBucketsCommand({}));
  const bucketNames = bucketsRes.Buckets.map(b => b.Name);
  pass(`AWS credentials accepted — ${bucketNames.length} bucket(s) visible`);
  info(`Buckets: ${bucketNames.join(", ")}`);

  if (bucketNames.includes(process.env.S3_BUCKET_NAME)) {
    pass(`Target bucket found: ${process.env.S3_BUCKET_NAME}`);
  } else {
    fail(`Target bucket NOT found: ${process.env.S3_BUCKET_NAME}`);
  }

  const objectsRes = await s3.send(new ListObjectsV2Command({
    Bucket:  process.env.S3_BUCKET_NAME,
    Prefix:  "s3-knowledgebase/",
    MaxKeys: 10,
  }));

  if (objectsRes.Contents && objectsRes.Contents.length > 0) {
    pass(`Knowledge base has ${objectsRes.Contents.length} file(s) (showing first 10)`);
    objectsRes.Contents.forEach(obj => info(`${obj.Key} (${obj.Size} bytes)`));
  } else {
    fail(`No files found under s3-knowledgebase/ — bucket is empty`);
  }

} catch (err) {
  fail(`S3 connection failed: ${err.message}`);
}

// ── 3. OPENAI CONNECTION ──────────────────────────────────────────────────────
HEADER("STEP 3 — OpenAI Connection");

try {
  const response = await fetch(process.env.OPENAI_ENDPOINT, {
    method:  "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model:      process.env.OPENAI_MODEL,
      messages:   [{ role: "user", content: "Reply with the word PONG only." }],
      max_tokens: 5,
    }),
  });

  const rawText = await response.text();

  if (!rawText.startsWith("{")) {
    fail(`Non-JSON response from OpenAI: ${rawText}`);
  } else {
    const data = JSON.parse(rawText);
    if (!response.ok || data.error) {
      fail(`OpenAI API error — ${data.error?.message ?? rawText}`);
      info(`Type: ${data.error?.type} | Code: ${data.error?.code}`);
    } else {
      const reply = data.choices?.[0]?.message?.content?.trim();
      pass(`OpenAI responded — Model: ${data.model}`);
      pass(`Reply: "${reply}"`);
      info(`Tokens used: ${data.usage?.total_tokens}`);
    }
  }
} catch (err) {
  fail(`OpenAI connection failed: ${err.message}`);
}

// ── 4. SUMMARY ────────────────────────────────────────────────────────────────
HEADER("CONNECTION TEST COMPLETE");
console.log("  Check ✅ / ❌ above for each service.\n");
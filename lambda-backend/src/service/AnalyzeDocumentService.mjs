// src/service/AnalyzeDocumentService.mjs
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

import { DetectDocumentTextCommand } from "@aws-sdk/client-textract";
import { s3 } from "../client/S3BucketClient.mjs";
import { textract } from "../client/TextractClient.mjs";
import { generateAnswer } from "./GenerateAnswerService.mjs";

const BUCKET_NAME = process.env.S3_BUCKET_NAME;
const REGION      = process.env.AWS_REGION;



// ── Step 1: Upload file temporarily to S3 ────────────────
async function uploadTempFile(fileBase64, fileName) {
  const buffer = Buffer.from(fileBase64, "base64");
  const key    = `temp/${Date.now()}-${fileName}`;

  await s3.send(new PutObjectCommand({
    Bucket:      BUCKET_NAME,
    Key:         key,
    Body:        buffer,
    ContentType: fileName.endsWith(".pdf") ? "application/pdf" : "image/jpeg",
  }));

  console.log("Uploaded temp file:", key);
  return key;
}

// ── Step 2: Run Textract on the S3 object ────────────────
async function extractTextFromS3(key) {
  const command = new DetectDocumentTextCommand({
    Document: {
      S3Object: {
        Bucket: BUCKET_NAME,
        Name:   key,
      },
    },
  });

  const response = await textract.send(command);

  // Extract all LINE blocks and join them
  const lines = response.Blocks
    .filter((b) => b.BlockType === "LINE")
    .map((b) => b.Text ?? "")
    .join("\n");

  console.log("Extracted text length:", lines.length);
  return lines;
}

// ── Step 3: Delete temp file from S3 ─────────────────────
async function deleteTempFile(key) {
  await s3.send(new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key:    key,
  }));
  console.log("Deleted temp file:", key);
}

// ── Step 4: Build recommendation prompt ──────────────────
function buildTORPrompt(extractedText) {
  return `
The following is text extracted from a student's Transcript of Records (TOR) or Diploma.
Please analyze it and recommend the most suitable UPOU degree programs based on:
1. Their previous degree/program
2. Their field of study
3. Their academic background

Only recommend programs that exist in UPOU (FED, FICS, FMDS).
Be specific — mention the exact program name and acronym.
Explain why each recommended program fits their background.

--- EXTRACTED DOCUMENT TEXT ---
${extractedText}
--- END OF DOCUMENT ---
  `.trim();
}

// ── Main export ───────────────────────────────────────────
export async function analyzeDocument(fileBase64, fileType, fileName) {
  let tempKey = null;

  try {
    console.log("===========================================");
    console.log("       Analyzing Document via Textract     ");
    console.log("===========================================");
    console.log("File Name :", fileName);
    console.log("File Type :", fileType);

    // 1. Upload to S3
    tempKey = await uploadTempFile(fileBase64, fileName);

    // 2. Extract text via Textract
    const extractedText = await extractTextFromS3(tempKey);

    if (!extractedText || extractedText.trim().length < 20) {
      return {
        success:       false,
        extractedText: "",
        recommendation: "Could not extract enough text from the document. Please ensure the document is clear and readable.",
      };
    }

    // 3. Build prompt and get recommendation from OpenAI
    const prompt  = buildTORPrompt(extractedText);
    const result  = await generateAnswer(prompt, [], {
      matched:   1,
      documents: [{
        fileName:    fileName,
        folder:      "temp",
        content:     extractedText,
      }],
    });

    return {
      success:        true,
      extractedText,
      recommendation: result.answer,
    };

  } catch (error) {
    console.error("Analyze Document Error:", error.message);
    throw error;
  } finally {
    // 4. Always delete temp file
    if (tempKey) {
      try {
        await deleteTempFile(tempKey);
      } catch (e) {
        console.error("Failed to delete temp file:", e.message);
      }
    }
  }
}
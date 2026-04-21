import { s3 }                from '../client/S3BucketClient.mjs';
import { GetObjectCommand }  from '@aws-sdk/client-s3';

const BUCKET_NAME = 'upou-degree-programs-s3bucket';

// Helper: Convert S3 stream to string
async function streamToString(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

// Helper: Fetch single document content from S3
async function fetchDocumentContent(key) {
  try {

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key:    key
    });

    const response = await s3.send(command);
    const content  = await streamToString(response.Body);

    console.log(`Fetched document: ${key} (${content.length} characters)`);

    return {
      key,
      content,
      success: true
    };

  } catch (error) {
    console.error(`Failed to fetch document: ${key}`, error);
    return {
      key,
      content: null,
      success: false
    };
  }
}

// Main: Build context from S3 document keys
export async function buildContext(s3Context, userQuestion) {
  try {
    console.log("++++++++++ Inside the Build Context Service +++++++++ " );
    console.log("S3 Context :", s3Context);
    console.log("User Question:", userQuestion);


    // 1. Check if s3Result has documents
    if (!s3Result.found || s3Result.documents.length === 0) {
      console.log("No documents to build context from.");
      return {
        success:  false,
        context:  null,
        message:  s3Result.message || "No relevant documents found.",
        docCount: 0
      };
    }

    console.log("Fetching content for", s3Result.documents.length, "documents...");

    // 2. Fetch content of all matched documents in parallel
    const fetchedDocs = await Promise.all(
      s3Result.documents.map(doc => fetchDocumentContent(doc.key))
    );

    // 3. Filter out failed fetches
    const successfulDocs = fetchedDocs.filter(doc => doc.success && doc.content);
    const failedDocs     = fetchedDocs.filter(doc => !doc.success);

    if (failedDocs.length > 0) {
      console.warn("Failed to fetch documents:", failedDocs.map(d => d.key));
    }

    // 4. Check if any documents were successfully fetched
    if (successfulDocs.length === 0) {
      return {
        success:  false,
        context:  null,
        message:  "Failed to retrieve document contents from S3.",
        docCount: 0
      };
    }

    // 5. Build the context string from all document contents
    const documentContext = successfulDocs
      .map(doc => `
============================
Document: ${doc.key}
============================
${doc.content}
      `.trim())
      .join('\n\n');

    // 6. Build the full OpenAI context prompt
    const context = `
You are a helpful assistant for UPOU (University of the Philippines Open University).
You only answer questions related to UPOU Degree Programs.
If the question is not related to UPOU Degree Programs, respond with exactly: "IRRELEVANT_TOPIC"

Use only the information provided in the documents below to answer the question.
If the answer is not found in the documents, say: "I'm sorry, I don't have enough information to answer that question."

---DOCUMENTS START---

${documentContext}

---DOCUMENTS END---

User Question: ${userQuestion}
    `.trim();

    console.log("Context built successfully.");
    console.log("Total documents used:", successfulDocs.length);
    console.log("Total context length:", context.length, "characters");

    // 7. Return the built context
    return {
      success:  true,
      context,
      docCount: successfulDocs.length,
      docKeys:  successfulDocs.map(doc => doc.key)
    };

  } catch (error) {
    console.error("Build Context Error:", error);
    throw new Error("Failed to build context.");
  }
}
import { extractKeywords } from "./src/service/ExtractKeywordsService.mjs";
import { fetchS3Context } from "./src/service/FetchS3Context.mjs";
import { generateAnswer } from "./src/service/GenerateAnswerService.mjs";
import { getUserQuestion } from "./src/service/GetUserQuestionService.mjs";
import { mergeMemory } from "./src/service/MergeMemoryService.mjs";

export const handler = async (event) => {

  // Handle CORS preflight
  if (event.requestContext?.http?.method === 'OPTIONS' || event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "POST,OPTIONS,GET",
      },
      body: ""
    };
  }

  
  try {
    // 1. Get User Question
    const { userQuestion, chatHistory } = await getUserQuestion(event);
    console.log("User Question:", userQuestion);

    // 2. Merge Memory
    const searchTarget = await mergeMemory(userQuestion, chatHistory);
    console.log("Merge Memory:", searchTarget);

    // 3. Extract Keywords
    const keywords = await extractKeywords(searchTarget);
    console.log("Extracted Keywords:", keywords);

    // 4. Fetch S3 Context
    const s3Context = await fetchS3Context(keywords);
    console.log("S3 Context:", s3Context);

    // 5. Generate Answer
    const result = await generateAnswer(userQuestion, chatHistory, s3Context);
    console.log("Generated Answer:", result);

    // 6. Return success response
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      },
      body: JSON.stringify({
        answer:     result.answer,
        isRelevant: result.isRelevant,
        tokensUsed: result.tokensUsed,
        model:      result.model
      })
    };

  } catch (error) {
    console.error("Handler Error:", error.message);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        answer: "Sorry, something went wrong. Please try again.",
        error:  error.message
      })
    };
  }
};
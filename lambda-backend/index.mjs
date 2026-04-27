import { getUserQuestion }      from './src/service/GetUserQuestionService.mjs';

import { extractKeywords }      from './src/service/ExtractKeywordsService.mjs';
import { fetchS3Context }       from './src/service/FetchS3Context.mjs';
import { sendReply }            from './src/service/SendReplyService.mjs';



export const handler = async (event) => {
    // 1. Get User Question
        const {userQuestion, chatHistory} = await GetUserQuestion(event);
        console.log("User Question: ", userQuestion);
    
    // 3.Extract Keywords
    const keywords = await extractKeywords(searchTarget);
    console.log("Extracted Keywords:", keywords);


    // 4. Fetch S3 Context
    const s3Context = await fetchS3Context(keywords);
    console.log("S3 Context found:", s3Context);






    
     // ── Send reply ───────────────────────────────────────────
  if (body._route === "send-reply") {
    try {
      const result = await sendReply(
        body.toEmail,
        body.ticketId,
        body.replyText,
        body.studentName,
      );
      return { statusCode: 200, headers: CORS, body: JSON.stringify(result) };
    } catch (error) {
      console.error("Send Reply Route Error:", error.message);
      return {
        statusCode: 500,
        headers: CORS,
        body: JSON.stringify({ error: "Failed to send reply." }),
      };
    }
  }


}

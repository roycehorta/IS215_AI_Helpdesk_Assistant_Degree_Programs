import { extractKeywords } from "./src/service/ExtractKeywordsService.mjs";
import { fetchS3Context } from "./src/service/FetchS3Context.mjs";
import { generateAnswer } from "./src/service/GenerateAnswerService.mjs";
import { generateTicket } from "./src/service/GenerateTicketService.mjs";
import { getChecklist } from "./src/service/GetChecklistService.mjs";
import { getTickets } from "./src/service/GetTicketsService.mjs";
import { getUserQuestion } from "./src/service/GetUserQuestionService.mjs";
import { mergeMemory } from "./src/service/MergeMemoryService.mjs";
import { saveChecklist } from "./src/service/SaveChecklistService.mjs";
import { sendReply } from "./src/service/SendReplyService.mjs";

// ── Shared CORS headers ───────────────────────────────────────────────────────
const CORS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "POST,OPTIONS,GET",
};

export const handler = async (event) => {
  // CORS preflight
  if (
    event.httpMethod === "OPTIONS" ||
    event.requestContext?.http?.method === "OPTIONS"
  ) {
    return { statusCode: 200, headers: CORS, body: "" };
  }

  // Parse body first
  const body = JSON.parse(event.body || "{}");
  console.log("Incoming _route:", body._route);

  if (body._route === "ticket") {
    try {
      const ticket = await generateTicket(
        body.description || "No description",
        body.transcript || [],
        {
          name: body.name,
          email: body.email,
          studentId: body.studentId,
          category: body.category,
          description: body.description,
        },
      );
      return { statusCode: 200, headers: CORS, body: JSON.stringify(ticket) };
    } catch (error) {
      console.error("Ticket Route Error:", error.message);
      return {
        statusCode: 500,
        headers: CORS,
        body: JSON.stringify({ error: "Failed to create ticket." }),
      };
    }
  }
}

  if (body._route === "get-tickets") {
    try {
      const result = await getTickets();
      return { statusCode: 200, headers: CORS, body: JSON.stringify(result) };
    } catch (error) {
      console.error("Get Tickets Route Error:", error.message);
      return {
        statusCode: 500,
        headers: CORS,
        body: JSON.stringify({ error: "Failed to fetch tickets." }),
      };
    }
  }

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

  // ── Save checklist ───────────────────────────────────
  if (body._route === "save-checklist") {
    try {
      const result = await saveChecklist(body.itemId, body.status);
      return { statusCode: 200, headers: CORS, body: JSON.stringify(result) };
    } catch (error) {
      console.error("Save Checklist Route Error:", error.message);
      return {
        statusCode: 500,
        headers: CORS,
        body: JSON.stringify({ error: "Failed to save checklist." }),
      };
    }
  }

  // ── Get checklist ────────────────────────────────────
  if (body._route === "get-checklist") {
    try {
      const result = await getChecklist();
      return { statusCode: 200, headers: CORS, body: JSON.stringify(result) };
    } catch (error) {
      console.error("Get Checklist Route Error:", error.message);
      return {
        statusCode: 500,
        headers: CORS,
        body: JSON.stringify({ error: "Failed to fetch checklist." }),
      };
    }
  }
  // ── Chat route ──────────────────────────────────────
  try {
    const { userQuestion, chatHistory } = await getUserQuestion(event);
    console.log("User Question:", userQuestion);

    const searchTarget = await mergeMemory(userQuestion, chatHistory);
    const keywords = await extractKeywords(searchTarget);
    const s3Context = await fetchS3Context(keywords);
    const result = await generateAnswer(userQuestion, chatHistory, s3Context);

    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({
        answer: result.answer,
        isRelevant: result.isRelevant,
        tokensUsed: result.tokensUsed,
        model: result.model,
      }),
    };
  } catch (error) {
    console.error("Handler Error:", error.message);
    return {
      statusCode: 500,
      headers: CORS,
      body: JSON.stringify({
        answer: "Sorry, something went wrong. Please try again.",
        error: error.message,
      }),
    };
  }
}
// GenerateTicketService.mjs
import { PutItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { dynamo } from '../client/DynamoDBClient.mjs';

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;
if (!TABLE_NAME) throw new Error("Missing environment variable: DYNAMODB_TABLE_NAME");

// ── Atomically increment the shared counter stored in the same DynamoDB table ─
// The "__COUNTER__" item is a reserved row — it will never appear as a ticket
// because GetTicketsService filters it out (ticketId starting with "TKT-" only).
// UpdateItem with ADD is atomic, so concurrent Lambda calls never produce the same number.
async function nextTicketId() {
  // Atomically increment the number
  const result = await dynamo.send(new UpdateItemCommand({
    TableName: TABLE_NAME,
    Key: { ticketId: { S: "__COUNTER__" } },
    UpdateExpression: "SET #n = if_not_exists(#n, :zero) + :inc, #l = if_not_exists(#l, :initLetter)",
    ExpressionAttributeNames:  { "#n": "number", "#l": "letter" },
    ExpressionAttributeValues: {
      ":inc":        { N: "1" },
      ":zero":       { N: "0" },
      ":initLetter": { S: "A" },
    },
    ReturnValues: "ALL_NEW",
  }));

  let num    = Number(result.Attributes.number.N);
  let letter = result.Attributes.letter?.S ?? "A";

  // Roll over: if num exceeded 999, reset and advance letter
  if (num > 999) {
    letter = String.fromCharCode(letter.charCodeAt(0) + 1);
    num = 1;
    await dynamo.send(new UpdateItemCommand({
      TableName: TABLE_NAME,
      Key: { ticketId: { S: "__COUNTER__" } },
      UpdateExpression: "SET #n = :one, #l = :newLetter",
      ExpressionAttributeNames:  { "#n": "number", "#l": "letter" },
      ExpressionAttributeValues: { ":one": { N: "1" }, ":newLetter": { S: letter } },
    }));
  }

  return `TX-${letter}${String(num).padStart(3, '0')}`;
}

export async function generateTicket(userQuestion, chatHistory, meta = {}) {
  try {
    console.log("===========================================");
    console.log("         Generating Support Ticket         ");
    console.log("===========================================");
    console.log("Question     :", userQuestion);
    console.log("History Len  :", chatHistory.length);
    console.log("Name         :", meta.name        ?? "Anonymous");
    console.log("Email        :", meta.email        ?? "N/A");
    console.log("Category     :", meta.category     ?? "general");
    console.log("===========================================");

   const ticketId = await nextTicketId();
    const createdAt = new Date().toISOString();

    await dynamo.send(new PutItemCommand({
      TableName: TABLE_NAME,
      Item: {
        ticketId:    { S: ticketId },
        question:    { S: userQuestion },
        chatHistory: { S: JSON.stringify(chatHistory) },
        status:      { S: "OPEN" },
        createdAt:   { S: createdAt },
        name:        { S: meta.name        ?? "Anonymous" },
        email:       { S: meta.email       ?? "" },
        studentId:   { S: meta.studentId   ?? "" },
        category:    { S: meta.category    ?? "general" },
        description: { S: meta.description ?? "" },
      }
    }));

  // ── Send confirmation email to student ────────────────────────────────────
    if (meta.email) {
      const { sendTicketConfirmation } = await import("./BrevoService.mjs");
      await sendTicketConfirmation({
        toEmail:     meta.email,
        toName:      meta.name ?? "Student",
        ticketId,
        subject:     meta.category ?? "Support Ticket",
        description: meta.description ?? userQuestion,
      });
    }

    console.log("===========================================");
    console.log("       Ticket Created Successfully         ");
    console.log("===========================================");
    console.log("Ticket ID  :", ticketId);
    console.log("Created At :", createdAt);
    console.log("Status     : OPEN");
    console.log("===========================================");

    return {
      success:  true,
      ticketId,
      createdAt,
      message:  "A support ticket has been created. A UPOU staff member will get back to you shortly."
    };

  } catch (error) {
    console.error("Generate Ticket Error name    :", error.name);
    console.error("Generate Ticket Error message :", error.message);
    throw new Error("Failed to create support ticket.");
  }
}

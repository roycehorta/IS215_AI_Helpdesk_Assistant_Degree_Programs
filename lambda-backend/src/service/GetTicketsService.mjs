// src/service/GetTicketsService.mjs
import { ScanCommand } from '@aws-sdk/client-dynamodb';
import { dynamo } from '../client/DynamoDBClient.mjs';

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;
if (!TABLE_NAME) throw new Error("Missing environment variable: DYNAMODB_TABLE_NAME");

export async function getTickets() {
  try {
    console.log("===========================================");
    console.log("         Fetching All Tickets              ");
    console.log("===========================================");

    const result = await dynamo.send(new ScanCommand({
      TableName: TABLE_NAME,
    }));

    const tickets = (result.Items ?? [])
      // Filter out the internal counter row — it's not a real ticket
      .filter(item => item.ticketId?.S && item.ticketId.S !== "__COUNTER__")
      .map(item => ({
        ticketId:    item.ticketId?.S    ?? "",
        question:    item.question?.S    ?? "",
        name:        item.name?.S        ?? "Anonymous",
        email:       item.email?.S       ?? "",
        studentId:   item.studentId?.S   ?? "",
        category:    item.category?.S    ?? "general",
        description: item.description?.S ?? "",
        status:      item.status?.S      ?? "OPEN",
        createdAt:   item.createdAt?.S   ?? "",
        chatHistory: item.chatHistory?.S ? JSON.parse(item.chatHistory.S) : [],
      }));

    // Sort by createdAt descending (newest first)
    tickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    console.log(`Fetched ${tickets.length} tickets`);

    return { success: true, tickets };

  } catch (error) {
    console.error("Get Tickets Error:", error.message);
    throw new Error("Failed to fetch tickets.");
  }
}

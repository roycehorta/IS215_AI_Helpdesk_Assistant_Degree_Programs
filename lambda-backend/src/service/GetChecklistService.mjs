import { ScanCommand } from "@aws-sdk/client-dynamodb";
import { dynamo } from "../client/DynamoDBClient.mjs";

const TABLE_NAME = "upou-project-checklist";

export async function getChecklist() {
  try {
    console.log("Fetching checklist from DynamoDB...");

    const result = await dynamo.send(new ScanCommand({ TableName: TABLE_NAME }));

    const statuses = {};
    result.Items?.forEach(item => {
      statuses[Number(item.itemId.N)] = item.status?.BOOL ?? false;
    });

    console.log("Fetched checklist statuses:", statuses);
    return { success: true, statuses };

  } catch (error) {
    console.error("Get Checklist Error:", error.message);
    throw new Error("Failed to fetch checklist.");
  }
}
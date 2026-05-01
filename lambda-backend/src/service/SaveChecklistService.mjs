import { UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { dynamo } from "../client/DynamoDBClient.mjs";

const TABLE_NAME = "upou-project-checklist";

export async function saveChecklist(itemId, status) {
  try {
    console.log("Saving checklist item:", itemId, status);

    await dynamo.send(new UpdateItemCommand({
      TableName: TABLE_NAME,
      Key: { itemId: { N: String(itemId) } },  // ← String() not Number()
      UpdateExpression: "SET #s = :status",
      ExpressionAttributeNames:  { "#s": "status" },
      ExpressionAttributeValues: { ":status": { BOOL: status } },
    }));

    console.log("Checklist item saved:", itemId);
    return { success: true };

  } catch (error) {
    console.error("Save Checklist Error:", error.message);
    throw new Error("Failed to save checklist item.");
  }
}
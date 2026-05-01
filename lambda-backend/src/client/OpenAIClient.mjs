// Handle error response
if (!response.ok) {

  // ✅ Read as text first — don't assume it's JSON
  const errorBody = await response.text();

  console.error("===========================================");
  console.error("           OpenAI API Error                ");
  console.error("===========================================");
  console.error("Status  :", response.status);
  console.error("Body    :", errorBody);

  // ✅ Only try to parse as JSON if it looks like JSON
  if (errorBody.startsWith("{")) {
    try {
      const parsedError = JSON.parse(errorBody);
      console.error("Error Type    :", parsedError.error?.type);
      console.error("Error Message :", parsedError.error?.message);
      console.error("Error Code    :", parsedError.error?.code);
    } catch {
      console.error("Could not parse error body as JSON.");
    }
  } else {
    // ✅ Log plain text error directly
    console.error("Plain Text Error:", errorBody);
  }

  console.error("===========================================");
  throw new Error(`OpenAI API failed — Status: ${response.status} — ${errorBody}`);
}
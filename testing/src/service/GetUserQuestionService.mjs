export function getUserQuestion(event) {
  try {

    // 1. Parse the request body
    const body = JSON.parse(event.body || "{}");

    // 2. Extract fields
    const userQuestion = body.question || "";
    const chatHistory  = body.history  || [];

    // 3. Validate userQuestion is not empty
    if (!userQuestion.trim()) {
      throw new Error("Question is required.");
    }

    console.log("User Question:", userQuestion);
    console.log("Chat History:",  chatHistory);

    // 4. Return the extracted fields
    return { userQuestion, chatHistory };

  } catch (error) {
    console.error("Error parsing request:", error);
    throw new Error("Invalid request. Please provide a question.");
  }
}
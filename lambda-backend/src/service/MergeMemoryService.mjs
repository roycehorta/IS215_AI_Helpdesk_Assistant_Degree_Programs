// Added MergeMemoryService
export const mergeMemory = (userQuestion, chatHistory) => {
  console.log("Inside Merge Memory Service");

  if (chatHistory.length === 0) return userQuestion.toLowerCase();

  const sectionKeywords = [
    "program description", "program goals", "mode of instruction",
    "curriculum", "courses", "core courses", "elective", "program of study",
    "admission", "requirements", "thesis", "units", "first year", "second year",
    "tell me more", "what else", "more details", "more info","overview", 
  ];

  const levelKeywords = [
    "undergraduate", "graduate certificates", "diplomas",
    "master's programs", "doctorate", "masters",
  ];

  const facultyKeywords = [
    "fics", "fed", "fmds",
    "faculty of education",
    "information and communication studies",
    "management and development studies",
  ];

  const lower = userQuestion.toLowerCase();

  // If user is browsing by level or faculty — reset context, use current question only
  const isBrowsing =
    levelKeywords.some((k) => lower.includes(k)) ||
    facultyKeywords.some((k) => lower.includes(k));

  if (isBrowsing) return lower;

  // If user is asking a section/follow-up question — find the active program
  const isSectionRequest = sectionKeywords.some((k) => lower.includes(k));

  if (isSectionRequest) {
    // Walk back through user messages to find the last program mentioned
    const userMessages = chatHistory
      .filter((msg) => msg.role === "user")
      .map((msg) => msg.content.trim());

    // Last user message that is NOT a section keyword = active program
    const activeProgram = [...userMessages]
      .reverse()
      .find((msg) => !sectionKeywords.some((k) => msg.toLowerCase().includes(k)));

    if (activeProgram) {
      console.log("Active Program Context:", activeProgram);
      return `${activeProgram} ${userQuestion}`.toLowerCase();
    }
  }

  // Default — just use current question
  return lower;
};
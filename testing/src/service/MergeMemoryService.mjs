export const mergeMemory = (userQuestion, chatHistory) => {
    console.log("Inside Merge Memory Service");
    const recentContext = chatHistory
      .slice(-2)
      .map((msg) => msg.content)
      .join(" ");
    return (recentContext + " " + userQuestion).toLowerCase();
  };
  
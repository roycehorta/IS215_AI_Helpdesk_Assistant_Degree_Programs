// Common English stop words to filter out
const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "is", "it", "its", "was", "are", "were",
  "be", "been", "being", "have", "has", "had", "do", "does", "did",
  "will", "would", "could", "should", "may", "might", "shall", "can",
  "what", "which", "who", "whom", "this", "that", "these", "those",
  "i", "me", "my", "we", "our", "you", "your", "he", "she", "his",
  "her", "they", "them", "their", "how", "when", "where", "why",
  "all", "any", "both", "each", "few", "more", "most", "other",
  "some", "such", "no", "not", "only", "same", "so", "than", "too",
  "very", "just", "about", "above", "after", "before", "between",
  "into", "through", "during", "tell", "give", "list", "show",
  "please", "want", "need", "know", "get", "make", "like", "use"
]);

// To avoid filtering important acronyms
const PRESERVE_TERMS = new Set([
  "fed", "fics", "fmds", "bes", "bams", "mde", "mpm", "msw", "mis",
  "mdc", "asit", "dcs", "aadda", "aade", "gcde", "gcas", "dsus", "mih",
  "mne", "mrdm", "mcdr", "menrm", "mlvm", "man", "mas", "dlle", "dmt",
  "dst", "dsse", "malle", "masse", "mih", "dcomm", "denrm", "dlup",
  "dlvm", "drdm", "dsw", "dwd", "asidt", "aa", "upou", "tor", "myportal",
  "law", "medicine", "md", "llb",

export function extractKeywords(searchTarget) {
  console.log("+++++++ Inside the Extract Keywords Service +++++++");
  console.log("Search Target :", searchTarget);

  try {
     // 1. Lowercase the string
    const lowerText = searchTarget.toLowerCase();
    console.log("Lowercased Text:", lowerText);
    
    // 2. Remove special characters and punctuation
    const cleanText = lowerText.replace(/[^a-z0-9\s]/g, "");
    console.log("Cleaned Text:", cleanText);

    // 3. Split into individual words
    const words = cleanText.split(/\s+/).filter((word) => word.length > 0)
    console.log("Words:", words);

    // 4. Filter out stop words and short words (less than 3 characters)
    const keywords = words.filter(
      (word) =>
        PRESERVE_TERMS.has(word) || (!STOP_WORDS.has(word) && word.length >= 3),
    );
    console.log("Keywords after stop word removal:", keywords);

    // 5. Remove duplicate keywords
    const uniqueKeywords = [...new Set(keywords)];
    console.log("Unique Keywords:", uniqueKeywords);
    
    return uniqueKeywords;


  } catch (error) {
    console.error("Extract Keywords Error:", error);
    throw new Error("Failed to extract keywords.");
  }
}
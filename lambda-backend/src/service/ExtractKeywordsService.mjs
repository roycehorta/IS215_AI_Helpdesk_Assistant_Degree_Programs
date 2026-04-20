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
    "into", "through", "during", "tell", "me", "give", "list", "show",
    "please", "want", "need", "know", "get", "make", "like", "use"
  ]);
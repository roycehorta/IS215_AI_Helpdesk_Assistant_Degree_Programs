import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({ region: process.env.AWS_REGION || "ap-southeast-1" });

const BUCKET      = process.env.S3_BUCKET_NAME;
const BASE_PREFIX = (process.env.S3_PREFIX || "s3-knowledgebase") + "/";
const TOP_K       = 5;   // used for specific-program searches only

// ── Lookup tables ─────────────────────────────────────────────────────────────

const FACULTY_MAP = {
  fed: "fed",
  "faculty of education": "fed",
  education: "fed",
  fics: "fics",
  "faculty of information and communication studies": "fics",
  "information and communication": "fics",
  ict: "fics",
  fmds: "fmds",
  "faculty of management and development studies": "fmds",
  management: "fmds",
};

const LEVEL_MAP = {
  undergraduate: "undergraduate",  undergrad: "undergraduate",
  bachelor: "undergraduate",       baccalaureate: "undergraduate",
  associate: "undergraduate",      bs: "undergraduate",
  ab: "undergraduate",             ba: "undergraduate",
  diploma: "diploma",              "post-baccalaureate": "diploma",
  postbaccalaureate: "diploma",
  masters: "masters",   master: "masters",   "master's": "masters",
  ms: "masters",        ma: "masters",       mba: "masters",
  graduate: "masters",
  doctorate: "doctorate",  doctoral: "doctorate",  doctor: "doctorate",
  phd: "doctorate",        "ph.d": "doctorate",    "ph.d.": "doctorate",
  "graduate certificate": "graduate-certificate",
  "graduate-certificate": "graduate-certificate",
  "grad cert": "graduate-certificate",
  certificate: "graduate-certificate",
  gradcert: "graduate-certificate",
};

const TOPIC_TERMS = new Set([
  "curriculum", "admission", "admissions", "requirements", "units", "fees",
  "tuition", "courses", "schedule", "study", "research", "thesis",
  "dissertation", "program", "description", "goals", "elective", "core",
  "specialization", "contact", "faculty", "staff",
  "faculties", "programs", "departments", "offerings", "schools",
]);

const STOP_WORDS = new Set([
  "of", "in", "to", "at", "by", "or", "an", "is", "it", "as", "be", "do",
  "go", "if", "no", "on", "so", "up", "we", "he", "me", "my", "us", "vs",
  "am", "are", "was", "has", "had", "the", "and", "for", "not", "but",
  "with", "this", "that", "from", "have", "will", "been", "into", "its",
  "our", "can", "may", "who", "why", "how", "all", "any", "new", "use",
]);

/**
 * Institution-level noise: tokens present in every document that carry no
 * discriminating signal. Also includes common academic qualifiers like
 * "degree" and "academic" that look like acronyms (2–6 alpha chars) but
 * are not program codes — preventing them from triggering FIX-5 full scans.
 */
const NOISE_TOKENS = new Set([
  // University identity
  "upou", "university", "philippines", "open", "ph", "up",
  "los", "banos", "laguna",
  // Generic academic qualifiers
  // FIX: "degree" is 6 alpha chars and previously matched the acronym regex,
  //      setting acronym="degree" which (a) blocked isFullListingQuery and
  //      (b) triggered a wasteful last-resort full-bucket scan.
  "degree", "academic", "graduate", "postgraduate",
  // Common question verbs stripped by keyword extractors
  "what", "which", "where", "when", "tell", "list",
  "give", "show", "explain", "describe",
]);

// ── Keyword classifier ────────────────────────────────────────────────────────

function classifyKeywords(keywords) {
  const result = {
    faculty: null,
    level: null,
    acronym: null,
    programTerms: [],
    topicTerms: [],
  };

  const individualTokens = [];

  for (const raw of keywords) {
    const k = raw.toLowerCase().trim();
    if (!k) continue;
    if (FACULTY_MAP[k]) { result.faculty = result.faculty ?? FACULTY_MAP[k]; continue; }
    if (LEVEL_MAP[k])   { result.level   = result.level   ?? LEVEL_MAP[k];   continue; }
    individualTokens.push(...raw.trim().split(/\s+/).filter(Boolean));
  }

  for (const raw of individualTokens) {
    const k = raw.toLowerCase();
    if (!k) continue;
    if (FACULTY_MAP[k])     { result.faculty  = result.faculty  ?? FACULTY_MAP[k]; continue; }
    if (LEVEL_MAP[k])       { result.level    = result.level    ?? LEVEL_MAP[k];   continue; }
    if (NOISE_TOKENS.has(k)) { continue; }
    if (TOPIC_TERMS.has(k)) { result.topicTerms.push(k); continue; }
    if (STOP_WORDS.has(k))  { continue; }
    if (/^[A-Za-z]{2,6}$/.test(raw)) { result.acronym = result.acronym ?? k; continue; }
    result.programTerms.push(k);
  }

  return result;
}

// ── S3 key parser ─────────────────────────────────────────────────────────────

function parseS3Key(s3Key) {
  const parts    = s3Key.split("/");
  const filename = parts[parts.length - 1].replace(/\.md$/, "");
  const segs     = filename.split("_");

  const faculty  = segs[0] ?? null;
  const acronym  = segs[1] ?? null;
  const nameSlug = segs.slice(2).join("-");
  const nameWords = nameSlug
    .split("-")
    .filter(w => w.length > 1 && !STOP_WORDS.has(w.toLowerCase()));

  const isFacultyOverview =
    acronym === "faculty" || (acronym ?? "").startsWith("faculty");

  const level =
    !isFacultyOverview && parts.length >= 4
      ? parts[parts.length - 2]
      : null;

  return { faculty, acronym, nameWords, level, isFacultyOverview };
}

// ── Scoring ───────────────────────────────────────────────────────────────────

function scoreFilename(parsed, classified) {
  let score = 0;

  if (classified.acronym && parsed.acronym === classified.acronym) score += 5;

  for (const term of classified.programTerms) {
    if (parsed.nameWords.includes(term) || parsed.acronym === term) score += 2;
  }

  const isFacultyTopicQuery = classified.topicTerms.some(
    t => ["faculties", "faculty", "schools", "departments", "programs", "offerings"].includes(t),
  );
  const isGeneralQuery =
    !classified.level &&
    !classified.acronym &&
    classified.programTerms.length === 0;

  if (parsed.isFacultyOverview && (isGeneralQuery || isFacultyTopicQuery)) score += 5;

  return score;
}

function scoreContent(content, classified) {
  if (!content) return 0;
  const text = content.toLowerCase();
  let score = 0;

  const terms = [
    classified.acronym,
    ...classified.programTerms,
    ...classified.topicTerms,
  ].filter(Boolean);

  for (const term of terms) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const hits    = (text.match(new RegExp(`\\b${escaped}\\b`, "g")) || []).length;
    score += Math.min(hits, 5);
  }

  return score;
}
// ── S3 helpers ────────────────────────────────────────────────────────────────

async function listKeys(prefix) {
  const keys = [];
  let token;
  do {
    const res = await s3.send(new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: prefix,
      ...(token && { ContinuationToken: token }),
    }));
    for (const obj of res.Contents || []) {
      if (obj.Key.endsWith(".md")) keys.push(obj.Key);
    }
    token = res.IsTruncated ? res.NextContinuationToken : null;
  } while (token);
  return keys;
}

async function fetchFile(key) {
  try {
    const res = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
    const chunks = [];
    for await (const chunk of res.Body) chunks.push(chunk);
    return Buffer.concat(chunks).toString("utf-8");
  } catch {
    return null;
  }
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * fetchS3Context
 *
 * Searches S3 for UPOU degree program documents relevant to the given keywords.
 *
 * Three-tier search strategy:
 *   Tier 1 — S3 prefix filter  (zero reads  — faculty + level path narrowing)
 *   Tier 2 — Filename scoring  (zero reads  — acronym + name word matching)
 *   Tier 3 — Content scoring   (file reads  — topic/acronym hits in body text)
 *
 * Result cap:
 *   • Full-listing queries (faculty scoped, no specific program signal)
 *     → returns ALL files in the pool (no cap) so every program is included.
 *   • Specific-program queries (acronym or program name present)
 *     → capped at TOP_K = 5, ranked by relevance score.
 *
 * @param   {string[]} keywords
 * @returns {Promise<object>}
 */
export async function fetchS3Context(keywords) {

  if (!BUCKET) {
    return { success: false, error: "S3_BUCKET_NAME environment variable is not set." };
  }
  if (!Array.isArray(keywords) || keywords.length === 0) {
    return { success: false, error: "keywords must be a non-empty array." };
  }

  // ── Step 1: Classify ───────────────────────────────────────────────────────
  const classified = classifyKeywords(keywords);

  const isFacultyListQuery = classified.topicTerms.some(
    t => ["faculties", "faculty", "schools", "departments", "programs", "offerings"].includes(t),
  );

  const hasNavigationSignal =
    classified.faculty              ||
    classified.level                ||
    classified.acronym              ||
    classified.programTerms.length > 0 ||
    isFacultyListQuery;

  if (!hasNavigationSignal) {
    return {
      success: true,
      found: false,
      message:
        "Keywords are too general to locate a specific program. " +
        "Please include a faculty name, program level, or program acronym.",
      offerTicket: true,
      ticketPrompt:
        "Would you like to submit a support ticket so a UPOU staff member can answer your inquiry directly?",
      classifiedKeywords: classified,
    };
  }

  // ── Step 2 (Tier 1): S3 prefix filter ─────────────────────────────────────
  let prefix = BASE_PREFIX;
  if (classified.faculty)                     prefix += `${classified.faculty}/`;
  if (classified.faculty && classified.level) prefix += `${classified.level}/`;

  let allKeys = await listKeys(prefix);

  if (!classified.faculty && classified.level) {
    allKeys = allKeys.filter(k => k.includes(`/${classified.level}/`));
  }
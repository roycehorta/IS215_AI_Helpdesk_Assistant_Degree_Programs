import { GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { s3 } from '../client/S3BucketClient.mjs';

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

// Helper: Extract file name from full S3 key
function getFileName(key) {
  return key.split('/').pop();
}

// Helper: Extract folder path from full S3 key
function getFileLocation(key) {
  const parts = key.split('/');
  parts.pop();
  return parts.length > 0 ? parts.join('/') : '/';
}

// Helper: Convert S3 stream to string
async function streamToString(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

// Helper: Fetch MD file content from S3
async function fetchFileContent(key) {
  try {

    console.log("Reading file content:", key);

    const command  = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key });
    const response = await s3.send(command);
    const content  = await streamToString(response.Body);

    console.log(`File read: ${key} (${content.length} characters)`);
    return content;

  } catch (error) {
    console.error(`Failed to read file: ${key}`, error.message);
    return null;
  }
}

// Detect if query is broad/overview (needs faculty overview files)
function detectBroadQuery(keywords) {
  const broadTerms = ['faculties', 'faculty', 'programs', 'overview', 'all', 'list', 'upou', 'offered', 'available', 'offer', 'offers', 'group', 'catalog'];
  return keywords.some(k => broadTerms.includes(k.toLowerCase()));
}


// Helper: Detect ALL faculties from keywords
// Detect faculties from keywords
function detectFaculties(keywords) {
  const facultyMap = {
    'fics': 'fics', 'information': 'fics', 'communication': 'fics',
    'multimedia': 'fics', 'technology': 'fics', 'digital': 'fics',
    'it': 'fics', 'computer': 'fics', 'media': 'fics',
    'fed': 'fed', 'education': 'fed', 'teaching': 'fed',
    'teacher': 'fed', 'bes': 'fed', 'mde': 'fed', 'gcde': 'fed',
    'fmds': 'fmds', 'management': 'fmds', 'development': 'fmds',
    'public': 'fmds', 'health': 'fmds', 'social': 'fmds',
    'environment': 'fmds', 'land': 'fmds', 'sustainability': 'fmds',
    'nursing': 'fmds', 'research': 'fmds', 'governance': 'fmds',
  };

  const detected = new Set();
  for (const k of keywords) {
    const faculty = facultyMap[k.toLowerCase()];
    if (faculty) detected.add(faculty);
  }
  return detected.size > 0 ? [...detected] : null;
}
// Helper: Detect program level from keywords
function detectLevel(keywords) {
  const levels = {
    'undergraduate': 'undergraduate', 'bachelor': 'undergraduate',
    'associate': 'undergraduate', 'baccalaureate': 'undergraduate',
    'masters': 'masters', 'master': 'masters', "master's": 'masters',
    'graduate': 'masters',
    'doctorate': 'doctorate', 'doctoral': 'doctorate',
    'phd': 'doctorate', 'doctor': 'doctorate',
    'diploma': 'diploma',
    'certificate': 'graduate-certificate', 'graduate-certificate': 'graduate-certificate',
    'trimester': 'undergraduate',  
    'semester': 'masters',         
  };
  for (const k of keywords) {
    const match = levels[k.toLowerCase()];
    if (match) return match;
  }
  return null;
}

// Helper: Build list of S3 prefixes based on faculties and level
function buildPrefixes(faculties, level, isBroad) {
  const ALL_FACULTIES = ['fics', 'fed', 'fmds'];

  // Broad query — fetch all faculty overview files
  if (isBroad && !level) {
    return [
      's3-knowledgebase/fics/fics_faculty-of-information-and-communication-studies.md',
      's3-knowledgebase/fed/fed_faculty-of-education.md',
      's3-knowledgebase/fmds/fmds_faculty-of-management-and-development-studies.md',
    ];
  }

  // Specific faculty + level
  if (faculties && level) {
    return faculties.map(f => `s3-knowledgebase/${f}/${level}/`);
  }

  // Specific faculty only — get overview + all levels
  if (faculties && !level) {
    const prefixes = [];
    for (const f of faculties) {
      prefixes.push(`s3-knowledgebase/${f}/`);
    }
    return prefixes;
  }

  // Level only — search all faculties at that level
  if (!faculties && level) {
    return ALL_FACULTIES.map(f => `s3-knowledgebase/${f}/${level}/`);
  }

  // Nothing detected — return empty (handled by caller)
  return [];
}

// Helper: Fetch all keys for a single prefix
async function fetchKeysForPrefix(prefix) {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix
    });

    const response = await s3.send(command);

    if (!response.Contents || response.Contents.length === 0) {
      console.log("No documents found in prefix:", prefix);
      return [];
    }

    return response.Contents.map(obj => obj.Key);

  } catch (error) {
    console.error(`Failed to fetch keys for prefix: ${prefix}`, error);
    return [];
  }
}

// Helper: Build no match error message
function buildNoMatchMessage(faculties, level, keywords) {
  // Replace the "No faculty or level — search everything" fallback:
if (!faculties && !level) {
  return {
    found: false,
    matched: 0,
    faculties: null,
    level: null,
    keywords,
    prefixes: [],
    message: `I can only answer questions about UPOU degree programs. Please ask about a specific faculty (FICS, FED, FMDS) or program level (undergraduate, masters, doctorate, diploma, graduate-certificate).`,
    documents: []
  };
}
  if (faculties && level) {
    return `No ${level} programs found under ${faculties.join(' and ').toUpperCase()}. Please verify that ${faculties.join(' and ').toUpperCase()} offers ${level} programs.`;
  }
  if (faculties && !level) {
    return `No documents found under ${faculties.join(' and ').toUpperCase()}. Please try specifying a program level such as undergraduate, masters, doctorate, diploma, or graduate-certificate.`;
  }
  if (!faculties && level) {
    return `No ${level} programs found across all faculties. Please try specifying a faculty such as FICS, FED, or FMDS.`;
  }
  return `No documents found matching your search keywords: "${keywords.join(', ')}".`;
}

// Main: Search relevant documents and return contents
export async function fetchS3Context(keywords) {
  try {
    console.log("Searching S3 for keywords:", keywords);

    const faculties = detectFaculties(keywords);
    const level = detectLevel(keywords);
    const isBroad = detectBroadQuery(keywords);

    console.log("Detected Faculties:", faculties);
    console.log("Detected Level:", level);
    console.log("Is Broad Query:", isBroad);

    const prefixes = buildPrefixes(faculties, level, isBroad);
    console.log("S3 Prefixes:", prefixes);

    // Nothing to search
    if (prefixes.length === 0) {
      return {
        found: false,
        matched: 0,
        faculties, level, keywords,
        prefixes: [],
        message: `I can only answer questions about UPOU degree programs. Please ask about a specific faculty (FICS, FED, FMDS) or program level (undergraduate, masters, doctorate, diploma, graduate-certificate).`,
        documents: []
      };
    }

    // Check if prefixes are direct file keys (for broad queries)
    const isDirectFile = (prefix) => prefix.endsWith('.md');

    const allKeysNested = await Promise.all(
      prefixes.map(prefix =>
        isDirectFile(prefix)
          ? Promise.resolve([prefix])
          : fetchKeysForPrefix(prefix)
      )
    );

    const allKeys = [...new Set(allKeysNested.flat())];
    console.log("All Matched Keys:", allKeys);

    if (allKeys.length === 0) {
      return {
        found: false,
        matched: 0,
        faculties, level, keywords, prefixes,
        message: buildNoMatchMessage(faculties, level, keywords),
        documents: []
      };
    }

    // Limit to 10 most relevant files to avoid token overflow
    const limitedKeys = allKeys.slice(0, 10);
    console.log(`Fetching contents of ${limitedKeys.length} files (limited from ${allKeys.length})...`);

    const documentContents = await Promise.all(
      limitedKeys.map(async (key) => {
        const content = await fetchFileContent(key);
        return {
          fileName: getFileName(key),
          fileLocation: `s3://${BUCKET_NAME}/${key}`,
          folder: getFileLocation(key),
          key,
          content,
          contentLength: content ? content.length : 0,
          contentFetched: content !== null
        };
      })
    );

    const successfulDocs = documentContents.filter(doc => doc.contentFetched);
    const failedDocs = documentContents.filter(doc => !doc.contentFetched);

    return {
      found: true,
      matched: successfulDocs.length,
      faculties, level, keywords, prefixes,
      documents: successfulDocs,
      failed: failedDocs.length > 0 ? failedDocs.map(d => d.fileName) : []
    };

  } catch (error) {
    console.error("Fetch S3 Context Error:", error);
    throw new Error("Failed to fetch context from S3.");
  }
}
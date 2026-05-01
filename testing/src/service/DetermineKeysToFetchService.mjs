import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { s3 } from '../client/S3BucketClient.mjs';

const BUCKET_NAME = 'upou-degree-programs-s3bucket';

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

// Helper: Detect ALL faculties from keywords  ✅ now returns array
function detectFaculties(keywords) {
  const faculties = ['fics', 'fed', 'fmds'];
  const detected  = keywords
    .map(k => k.toLowerCase())
    .filter(k => faculties.includes(k));

  return detected.length > 0 ? detected : null;
}

// Helper: Detect program level from keywords
function detectLevel(keywords) {
  const levels = {
    'undergraduate':        'undergraduate',
    'masters':              'masters',
    'master':               'masters',
    'doctorate':            'doctorate',
    'doctoral':             'doctorate',
    'phd':                  'doctorate',
    'diploma':              'diploma',
    'graduate-certificate': 'graduate-certificate',
    'certificate':          'graduate-certificate'
  };

  for (const keyword of keywords) {
    const match = levels[keyword.toLowerCase()];
    if (match) return match;
  }
  return null;
}

// Helper: Build list of S3 prefixes based on faculties and level  ✅ returns array of prefixes
function buildPrefixes(faculties, level) {

  // Both faculties and level detected — one prefix per faculty
  if (faculties && level) {
    return faculties.map(faculty => `s3-knowledgebase/${faculty}/${level}/`);
  }

  // Only faculties detected — search all levels under each faculty
  if (faculties && !level) {
    return faculties.map(faculty => `s3-knowledgebase/${faculty}/`);
  }

  // Only level detected — search all faculties at that level
  if (!faculties && level) {
    return ['fics', 'fed', 'fmds'].map(faculty => `s3-knowledgebase/${faculty}/${level}/`);
  }

  // No faculty or level — search everything
  return ['s3-knowledgebase/'];
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

// Main: Search relevant documents based on keywords
export async function fetchS3Context(keywords) {
  try {

    console.log("Searching S3 for keywords:", keywords);

    // 1. Detect faculties and level from keywords
    const faculties = detectFaculties(keywords);
    const level     = detectLevel(keywords);

    console.log("Detected Faculties:", faculties);
    console.log("Detected Level:",     level);

    // 2. Build list of S3 prefixes
    const prefixes = buildPrefixes(faculties, level);
    console.log("S3 Prefixes:", prefixes);

    // 3. Fetch keys from ALL prefixes in parallel
    const allKeysNested = await Promise.all(
      prefixes.map(prefix => fetchKeysForPrefix(prefix))
    );

    // 4. Flatten nested arrays into one list and remove duplicates
    const allKeys = [...new Set(allKeysNested.flat())];
    console.log("All Matched Keys:", allKeys);

    // 5. Check if any documents found
    if (allKeys.length === 0) {
      return {
        matched:   0,
        faculties,
        level,
        keywords,
        prefixes,
        documents: []
      };
    }

    // 6. Map all keys to file names and locations
    const documents = allKeys.map(key => ({
      fileName:     getFileName(key),
      fileLocation: `s3://${BUCKET_NAME}/${key}`,
      folder:       getFileLocation(key),
      key
    }));

    console.log("Total Matched Documents:", documents.length);

    // 7. Return structured mapping
    return {
      matched:   documents.length,
      faculties,
      level,
      keywords,
      prefixes,
      documents
    };

  } catch (error) {
    console.error("Fetch S3 Context Error:", error);
    throw new Error("Failed to fetch context from S3.");
  }
}
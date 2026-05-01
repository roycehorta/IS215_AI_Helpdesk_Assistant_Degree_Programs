import { GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { s3 } from "../client/S3BucketClient.mjs";

const BUCKET_NAME = process.env.S3_BUCKET_NAME;

function getFileName(key) {
  return key.split("/").pop();
}

function getFileLocation(key) {
  const parts = key.split("/");
  parts.pop();
  return parts.length > 0 ? parts.join("/") : "/";
}

async function streamToString(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf-8");
}

async function fetchFileContent(key) {
  try {
    const command = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: key });
    const response = await s3.send(command);
    const content = await streamToString(response.Body);
    return content;
  } catch (error) {
    console.error(`Failed to read file: ${key}`, error.message);
    return null;
  }
}

function detectBroadQuery(keywords) {
  const broadTerms = [
    "faculties",
    "faculty",
    "programs",
    "all",
    "list",
    "upou",
    "offered",
    "available",
    "offer",
    "offers",
    "group",
    "catalog",
  ];
  return keywords.some((k) => broadTerms.includes(k.toLowerCase()));
}

function detectFaculties(keywords) {
  const facultyMap = {
    fics: "fics",
    information: "fics",
    communication: "fics",
    multimedia: "fics",
    technology: "fics",
    digital: "fics",
    it: "fics",
    computer: "fics",
    media: "fics",
    fed: "fed",
    education: "fed",
    teaching: "fed",
    teacher: "fed",
    bes: "fed",
    mde: "fed",
    gcde: "fed",
    fmds: "fmds",
    management: "fmds",
    public: "fmds",
    health: "fmds",
    social: "fmds",
    environment: "fmds",
    land: "fmds",
    sustainability: "fmds",
    nursing: "fmds",
    research: "fmds",
    governance: "fmds",
    mis: "fics",
    mdc: "fics",
    dcs: "fics",
    aadda: "fics",
    asit: "fics",
    bams: "fics",
    dcomm: "fics",
    malle: "fed",
    masse: "fed",
    gcde: "fed",
    dlle: "fed",
    dmt: "fed",
    dst: "fed",
    dsse: "fed",
    phded: "fed",
    mpm: "fmds",
    msw: "fmds",
    mih: "fmds",
    menrm: "fmds",
    mlvm: "fmds",
    mrdm: "fmds",
    man: "fmds",
    mne: "fmds",
    mas: "fmds",
    mcdr: "fmds",
    aade: "fmds",
    dsus: "fmds",
    gcas: "fmds",
    dih: "fmds",
    dlup: "fmds",
    dlvm: "fmds",
    drdm: "fmds",
    dsw: "fmds",
    dwd: "fmds",
    denrm: "fmds",
  };
  const detected = new Set();
  for (const k of keywords) {
    const faculty = facultyMap[k.toLowerCase()];
    if (faculty) detected.add(faculty);
  }
  return detected.size > 0 ? [...detected] : null;
}
function detectLevels(keywords) {
  const levelMap = {
    undergraduate: "undergraduate",
    bachelor: "undergraduate",
    associate: "undergraduate",
    baccalaureate: "undergraduate",
    trimester: "undergraduate",
    masters: "masters",
    master: "masters",
    "master's": "masters",
    "master's programs": "masters",
    semester: "masters",
    graduate: "graduate-certificate",
    certificate: "graduate-certificate",
    certificates: "graduate-certificate",
    "graduate-certificate": "graduate-certificate",
    "graduate-certificates": "graduate-certificate",
    "graduate certificates": "graduate-certificate",
    doctorate: "doctorate",
    doctorates: "doctorate",
    doctoral: "doctorate",
    phd: "doctorate",
    doctor: "doctorate",
    diploma: "diploma",
    diplomas: "diploma",
  };
  const found = new Set();
  for (const k of keywords) {
    const match = levelMap[k.toLowerCase()]; // lowercase lookup works now
    if (match) found.add(match);
  }
  return found.size > 0 ? [...found] : null;
}

function buildPrefixes(faculties, levels, isBroad) {
  const ALL_FACULTIES = ["fics", "fed", "fmds"];

  // Both faculties and levels — most specific
  if (faculties && levels) {
    return faculties.flatMap((f) =>
      levels.map((l) => `s3-knowledgebase/${f}/${l}/`),
    );
  }

  // Levels only — search all faculties at those levels
  if (!faculties && levels) {
    return ALL_FACULTIES.flatMap((f) =>
      levels.map((l) => `s3-knowledgebase/${f}/${l}/`),
    );
  }

  // Broad query with specific faculty but no level — fetch that faculty's overview
  if (isBroad && faculties && !levels) {
    return faculties.map((f) => {
      const name =
        f === "fics"
          ? "information-and-communication-studies"
          : f === "fed"
            ? "education"
            : "management-and-development-studies";
      return `s3-knowledgebase/${f}/${f}_faculty-of-${name}.md`;
    });
  }

  // Broad query, no faculty, no level — all three overviews
  if (isBroad && !faculties && !levels) {
    return [
      "s3-knowledgebase/fics/fics_faculty-of-information-and-communication-studies.md",
      "s3-knowledgebase/fed/fed_faculty-of-education.md",
      "s3-knowledgebase/fmds/fmds_faculty-of-management-and-development-studies.md",
    ];
  }

  // Faculty only, not broad — search everything under that faculty
  if (faculties && !levels) {
    return faculties.map((f) => `s3-knowledgebase/${f}/`);
  }

  // Nothing detected — fall back to all overviews
  return [
    "s3-knowledgebase/fics/fics_faculty-of-information-and-communication-studies.md",
    "s3-knowledgebase/fed/fed_faculty-of-education.md",
    "s3-knowledgebase/fmds/fmds_faculty-of-management-and-development-studies.md",
  ];
}

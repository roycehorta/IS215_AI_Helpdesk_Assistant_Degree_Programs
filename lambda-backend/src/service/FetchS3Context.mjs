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

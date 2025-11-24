const path = require("node:path");
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} = require("@aws-sdk/client-s3");

const memoryStore = new Map();
let s3Client;

const getBucketName = () => process.env.R2_BUCKET_NAME || "lumo-stage";

const getPublicBaseUrl = () => {
  if (process.env.R2_PUBLIC_URL) {
    return process.env.R2_PUBLIC_URL.replace(/\/$/, "");
  }

  if (process.env.R2_ACCOUNT_ID) {
    return `https://${
      process.env.R2_ACCOUNT_ID
    }.r2.cloudflarestorage.com/${getBucketName()}`;
  }

  // 테스트/개발 환경에서 기본 URL
  return `https://r2.local/${getBucketName()}`;
};

const getPublicUrl = (key) => `${getPublicBaseUrl()}/${key}`;

const isMockMode = () =>
  process.env.NODE_ENV === "test" || process.env.R2_USE_LOCAL === "true";

const ensureClient = () => {
  if (isMockMode()) {
    return null;
  }

  if (s3Client) {
    return s3Client;
  }

  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("Cloudflare R2 환경변수가 설정되지 않았습니다.");
  }

  s3Client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com/lumo-stage`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return s3Client;
};

const uploadBuffer = async ({ key, body, contentType }) => {
  if (!key || !body) {
    const error = new Error("업로드할 파일 정보가 없습니다.");
    error.status = 400;
    throw error;
  }

  if (isMockMode()) {
    memoryStore.set(key, { body, contentType });
    return {
      key,
      url: getPublicUrl(key),
    };
  }

  const client = ensureClient();
  const bucket = getBucketName();

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  return {
    key,
    url: getPublicUrl(key),
  };
};

const deleteObject = async (key) => {
  if (!key) {
    return;
  }

  if (isMockMode()) {
    memoryStore.delete(key);
    return;
  }

  const client = ensureClient();
  const bucket = getBucketName();

  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );
};

const downloadBuffer = async (key) => {
  if (!key) {
    return null;
  }

  if (isMockMode()) {
    const stored = memoryStore.get(key);
    return stored ? Buffer.from(stored.body) : null;
  }

  const client = ensureClient();
  const bucket = getBucketName();

  const response = await client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );

  if (!response.Body) {
    return null;
  }

  const chunks = [];
  for await (const chunk of response.Body) {
    chunks.push(Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
};

const sanitizeSegment = (segment) =>
  String(segment || "")
    .replace(/[^a-zA-Z0-9-_]/g, "")
    .slice(0, 32) || "common";

const generateAssetKey = ({ type, ownerId, projectId, originalName }) => {
  const ext = originalName ? path.extname(originalName) : "";
  const safeExt = ext ? ext.toLowerCase() : "";
  const shortOwner = sanitizeSegment(ownerId);
  const shortProject = projectId ? sanitizeSegment(projectId) : "library";
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return `${type}/${shortOwner}/${shortProject}/${unique}${safeExt}`;
};

const __memoryStore = memoryStore;

module.exports = {
  deleteObject,
  downloadBuffer,
  generateAssetKey,
  getPublicUrl,
  uploadBuffer,
  // 테스트 편의를 위한 내부 저장소 노출 (production에서는 사용하지 않음)
  __memoryStore,
};

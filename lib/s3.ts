// lib/s3.ts
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const REGION = process.env.AWS_REGION || "us-east-1";
const S3_BUCKET = process.env.S3_BUCKET;

if (!S3_BUCKET) {
  console.warn("S3_BUCKET not set. generateSignedUrl will fail without it.");
}

const s3Client = new S3Client({
  region: REGION,
  credentials:
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }
      : undefined,
});

export async function generateSignedUrl(ebookFileUrl: string, expiresIn = 60) {
  if (!ebookFileUrl) throw new Error("Missing ebookFileUrl");

  if (/^https?:\/\//i.test(ebookFileUrl)) {
    return ebookFileUrl;
  }

  if (ebookFileUrl.startsWith("s3://")) {
    const [, , ...parts] = ebookFileUrl.split("/");
    const bucket = parts.shift();
    const key = parts.join("/");
    if (!bucket || !key) throw new Error("Invalid s3:// URL");
    const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
    return await getSignedUrl(s3Client, cmd, { expiresIn });
  }

  if (!S3_BUCKET) throw new Error("S3_BUCKET env var is required to presign keys");
  const key = ebookFileUrl.replace(/^\/+/, "");
  const cmd = new GetObjectCommand({ Bucket: S3_BUCKET, Key: key });
  return await getSignedUrl(s3Client, cmd, { expiresIn });
}

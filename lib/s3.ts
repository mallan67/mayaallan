/**
 * lib/s3.ts
 *
 * STUB: Generate signed URL placeholder for environments that do not use AWS S3.
 */

export async function generateSignedUrl(ebookFileUrl: string, expiresIn = 60): Promise<string> {
  if (!ebookFileUrl) throw new Error("Missing ebookFileUrl");
  if (/^https?:\/\//i.test(ebookFileUrl)) return ebookFileUrl;
  return ebookFileUrl;
}

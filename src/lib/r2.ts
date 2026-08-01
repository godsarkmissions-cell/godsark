import { S3Client } from "@aws-sdk/client-s3";

// Cloudflare R2 is S3-API-compatible, so the regular AWS SDK v3 S3 client
// works against it — you just point `endpoint` at your R2 account and pass
// your R2 API token as the access key / secret. Server-side only: never
// import this file from a "use client" component.
if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY) {
  console.warn(
    "[r2] Missing R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY env vars — uploads will fail until these are set. See README."
  );
}

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
  },
});

export const R2_BUCKET = process.env.R2_BUCKET_NAME ?? "";

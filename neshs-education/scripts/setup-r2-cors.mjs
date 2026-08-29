// scripts/setup-r2-cors.mjs
//
// One-time setup script: configures CORS on your R2 bucket so the browser
// is allowed to PUT files directly to it using the presigned URLs from
// /api/upload. Without this, every direct upload will fail in the browser
// with a CORS error, even though the presigned URL itself is valid — R2
// does not expose CORS configuration in its dashboard UI, only via the S3
// API, which is what this script calls.
//
// Run once, locally, after setting the same R2 env vars you set in Vercel:
//   R2_ACCOUNT_ID=... R2_ACCESS_KEY_ID=... R2_SECRET_ACCESS_KEY=... R2_BUCKET_NAME=... \
//     node scripts/setup-r2-cors.mjs
//
// Re-run any time you need to change the allowed origins (e.g. after
// getting a custom domain, or the first time you deploy to a new Vercel
// preview URL pattern).

import { S3Client, PutBucketCorsCommand } from '@aws-sdk/client-s3';

const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME } = process.env;

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
  console.error('Missing one or more required env vars: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME');
  process.exit(1);
}

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY
  }
});

// AllowedOrigins uses '*' to start (works everywhere immediately, including
// Vercel preview deployments with random URLs). Once you're confident of
// your final production domain(s), replace '*' with the exact origin(s)
// (e.g. 'https://neshs-education.vercel.app') and re-run this script —
// AllowedHeaders must stay 'content-type' specifically ('*' is known not to
// work correctly on R2, even though it works on real AWS S3).
const corsConfig = {
  Bucket: R2_BUCKET_NAME,
  CORSConfiguration: {
    CORSRules: [
      {
        AllowedOrigins: ['*'],
        AllowedMethods: ['PUT'],
        AllowedHeaders: ['content-type'],
        MaxAgeSeconds: 3600
      }
    ]
  }
};

try {
  await r2Client.send(new PutBucketCorsCommand(corsConfig));
  console.log(`CORS configured successfully on bucket "${R2_BUCKET_NAME}".`);
  console.log('Direct browser uploads to R2 via presigned URLs should now work.');
} catch (err) {
  console.error('Failed to set CORS configuration:', err);
  process.exit(1);
}

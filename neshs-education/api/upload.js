// api/upload.js
//
// This is a plain Vercel serverless function — NOT a Next.js API route.
// Your project is built with Vite (confirmed by vite.config.js and no
// app/ or pages/ folder), so there's no Next.js framework wrapping this.
// Vercel automatically turns any .js file placed directly inside a
// top-level /api folder into its own serverless function, with routing
// based on the filename — this file becomes reachable at /api/upload.
//
// IMPORTANT: this file must live at the TOP LEVEL of your project, as:
//   api/upload.js
// (a sibling of src/, public/, package.json — NOT inside src/)
//
// IMPORTANT ARCHITECTURE NOTE: this route does NOT receive the file's
// bytes. Vercel serverless functions enforce a hard 4.5MB request body
// limit at the platform level, which cannot be raised by any config —
// it's enforced by Vercel's infrastructure before your code ever runs.
// Sending a video or slide deck's raw bytes through this function would
// fail the moment the file exceeds 4.5MB.
//
// Instead, this function only asks R2 for a short-lived PRESIGNED UPLOAD
// URL and returns it as a small JSON response. The browser then PUTs the
// actual file bytes directly to that URL — straight to Cloudflare,
// completely bypassing this Vercel function.
//
// Required setup:
//   1. npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
//      (you've already run this)
//   2. Set these in Vercel → Project → Settings → Environment Variables:
//        R2_ACCOUNT_ID
//        R2_ACCESS_KEY_ID
//        R2_SECRET_ACCESS_KEY
//        R2_BUCKET_NAME
//        NEXT_PUBLIC_R2_PUBLIC_URL   (the name is kept from the earlier
//          Next.js version for consistency with App.jsx — it works exactly
//          the same as any other env var here, the "NEXT_PUBLIC_" prefix
//          has no special meaning outside of an actual Next.js project)

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Keep in sync with MAX_UPLOAD_MB in App.jsx.
const MAX_UPLOAD_BYTES = 200 * 1024 * 1024; // 200MB

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
  }
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Vercel automatically parses a JSON request body into req.body for
    // plain serverless functions when Content-Type is application/json —
    // no extra setup needed, unlike some other Node hosting platforms.
    const { pathPrefix, fileName, fileSize, contentType } = req.body || {};

    if (!pathPrefix || !fileName) {
      return res.status(400).json({ error: 'pathPrefix and fileName are required' });
    }
    if (typeof fileSize === 'number' && fileSize > MAX_UPLOAD_BYTES) {
      return res.status(413).json({ error: `File exceeds the ${MAX_UPLOAD_BYTES / (1024 * 1024)}MB limit` });
    }

    const safeName = String(fileName).replace(/[^\w.\-]+/g, '_');
    const key = `${pathPrefix}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${safeName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType || 'application/octet-stream'
    });

    // 10 minutes is comfortably enough time to complete even a large
    // video's PUT request without leaving the signed URL valid indefinitely.
    const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 600 });

    const publicBase = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '').replace(/\/$/, '');
    const publicUrl = `${publicBase}/${key}`;

    return res.status(200).json({ uploadUrl, publicUrl, key });
  } catch (err) {
    console.error('R2 presign failed:', err);
    return res.status(500).json({ error: err?.message || 'Presign failed' });
  }
}
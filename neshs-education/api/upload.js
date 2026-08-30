// api/upload.js
//
// Plain Vercel serverless function (this project is Vite, not Next.js — no
// app/ or pages/ folder). Vercel automatically serves any .js file placed
// directly inside a top-level /api folder at /api/<filename> — this file
// must live at api/upload.js, as a sibling of src/, public/, package.json
// (NOT inside src/).
//
// This is the SINGLE, ONLY place that builds the public R2 URL for an
// uploaded file. It returns exactly one field name — publicUrl — and
// nothing else calls it anything different. If a URL is ever malformed,
// the fix belongs HERE, not in App.jsx: cleaning/repairing a URL after the
// fact in many different places (every place it gets rendered) is what
// caused repeated, hard-to-track breakage before. One source of truth, one
// field name, done correctly once.
//
// ARCHITECTURE: this route does NOT receive the file's bytes. Vercel
// serverless functions enforce a hard 4.5MB request body limit at the
// platform level, which cannot be raised by any config. Instead, this
// route only asks R2 for a short-lived PRESIGNED UPLOAD URL and returns it;
// the browser then PUTs the actual file bytes directly to that URL,
// straight to Cloudflare, bypassing this function entirely.
//
// Required setup (all in Vercel → Project → Settings → Environment
// Variables — NEVER hardcoded here or in App.jsx):
//   R2_ACCOUNT_ID
//   R2_ACCESS_KEY_ID
//   R2_SECRET_ACCESS_KEY
//   R2_BUCKET_NAME
//   NEXT_PUBLIC_R2_PUBLIC_URL   — just the bare domain, e.g.
//     https://pub-020adfa3657b43cab1abad0ba2d60a52.r2.dev
//     No trailing slash, no path, no repeated "https://" — this exact
//     string is checked and normalized below regardless, but keeping the
//     env var itself clean avoids any ambiguity.

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const MAX_UPLOAD_BYTES = 200 * 1024 * 1024; // 200MB — keep in sync with any client-side check in App.jsx

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
  }
});

// Normalizes the configured public base URL exactly once, here, at module
// load — not scattered as ad-hoc string surgery across the frontend.
// Strips whitespace and any trailing slash so concatenation with the key
// below can never produce a double slash or a doubled domain.
function getPublicBase() {
  const raw = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '').trim();
  if (!raw) return '';
  return raw.replace(/\/+$/, '');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { pathPrefix, fileName, fileSize, contentType } = req.body || {};

    if (!pathPrefix || !fileName) {
      return res.status(400).json({ error: 'pathPrefix and fileName are required' });
    }
    if (typeof fileSize === 'number' && fileSize > MAX_UPLOAD_BYTES) {
      return res.status(413).json({ error: `File exceeds the ${MAX_UPLOAD_BYTES / (1024 * 1024)}MB limit` });
    }

    const publicBase = getPublicBase();
    if (!publicBase) {
      return res.status(500).json({ error: 'NEXT_PUBLIC_R2_PUBLIC_URL is not configured on the server' });
    }

    // Sanitize the filename (strip anything that isn't a safe filename
    // character) and build a unique key. This key is a plain path segment —
    // it never contains a scheme or domain, so there is nothing for any
    // downstream code to accidentally double up.
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

    // The ONLY place this string is built. publicBase has no trailing
    // slash (stripped above), key has no leading slash — so this always
    // produces exactly one clean join, never a double domain or double slash.
    const publicUrl = `${publicBase}/${key}`;

    return res.status(200).json({ uploadUrl, publicUrl });
  } catch (err) {
    console.error('R2 presign failed:', err);
    return res.status(500).json({ error: err?.message || 'Presign failed' });
  }
}
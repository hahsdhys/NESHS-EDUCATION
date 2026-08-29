// api/upload.js
//
// This endpoint creates a short-lived Cloudflare R2 upload URL and returns the
// public object URL. The browser then uploads the raw file bytes directly to R2
// with a PUT request, bypassing the Vercel function body size limits.

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const MAX_UPLOAD_BYTES = 200 * 1024 * 1024;

if (!process.env.R2_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !process.env.R2_BUCKET_NAME || !process.env.NEXT_PUBLIC_R2_PUBLIC_URL) {
  console.warn('Cloudflare R2 upload is not fully configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, and NEXT_PUBLIC_R2_PUBLIC_URL.');
}

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
    const body = req.body || {};
    const { pathPrefix, fileName, fileSize, contentType } = body;

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

    const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 600 });
    const publicBase = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL || '').replace(/\/$/, '');
    const publicUrl = `${publicBase}/${key}`;

    return res.status(200).json({ uploadUrl, publicUrl, key });
  } catch (err) {
    console.error('R2 presign failed:', err);
    return res.status(500).json({ error: err?.message || 'R2 presign failed' });
  }
}
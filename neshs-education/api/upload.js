// api/upload.js
//
// This endpoint creates a short-lived Cloudflare R2 upload URL and returns the
// public object URL. The browser then uploads the raw file bytes directly to R2
// with a PUT request, bypassing the Vercel function body size limits.

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const MAX_UPLOAD_BYTES = 200 * 1024 * 1024;
const R2_CONFIG = {
  accountId: '66b793b50344e01915034db1ad4ec6df',
  accessKeyId: '5539a58fa179aeeeee1da51bca28f514',
  secretAccessKey: '3eae28bc2c8d1ee112d3aa871001b00673e927c2ceb50def6b35072a2e99f5e2',
  bucketName: 'neshs-education',
  publicUrl: 'https://pub-020adfa3657b43cab1abad0ba2d60a52.r2.dev'
};

const r2AccountId = process.env.R2_ACCOUNT_ID || R2_CONFIG.accountId;
const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID || R2_CONFIG.accessKeyId;
const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY || R2_CONFIG.secretAccessKey;
const r2BucketName = process.env.R2_BUCKET_NAME || R2_CONFIG.bucketName;
const r2PublicUrl = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL || R2_CONFIG.publicUrl).replace(/\/$/, '');

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: r2AccessKeyId,
    secretAccessKey: r2SecretAccessKey
  }
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body || {};
    const { pathPrefix, fileName, fileSize } = body;
    const contentType = body.contentType || 'video/mp4';

    if (!pathPrefix || !fileName) {
      return res.status(400).json({ error: 'pathPrefix and fileName are required' });
    }

    if (typeof fileSize === 'number' && fileSize > MAX_UPLOAD_BYTES) {
      return res.status(413).json({ error: `File exceeds the ${MAX_UPLOAD_BYTES / (1024 * 1024)}MB limit` });
    }

    const safeName = String(fileName).replace(/[^\w.\-]+/g, '_');
    const key = `${pathPrefix}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${safeName}`;

    const command = new PutObjectCommand({
      Bucket: r2BucketName,
      Key: key,
      ContentType: req.body.contentType || 'video/mp4'
    });

    const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 600 });
    const publicUrl = `${r2PublicUrl}/${key}`;

    return res.status(200).json({ uploadUrl, publicUrl, key });
  } catch (err) {
    console.error('R2 presign failed:', err);
    return res.status(500).json({ error: err?.message || 'R2 presign failed' });
  }
}
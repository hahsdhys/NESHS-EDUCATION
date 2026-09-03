// api/upload.js
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const MAX_UPLOAD_BYTES = 200 * 1024 * 1024; // 200MB limit

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
  }
});

// Sigurado nang may babalikang public base URL kahit walang na-set na ENV variable sa Vercel
function getPublicBase() {
  const fallbackUrl = 'https://pub-020adfa3657b43cab1abad0ba2d6ba57.r2.dev';
  const raw = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL || fallbackUrl).trim();
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

    // Nililinis ang filename para safe sa URL
    const safeName = String(fileName).replace(/[^\w.\-]+/g, '_');
    const key = `${pathPrefix}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${safeName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType || 'application/octet-stream'
    });

    const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 600 });
    const publicUrl = `${publicBase}/${key}`;

    return res.status(200).json({ uploadUrl, publicUrl, key });
  } catch (err) {
    console.error('R2 presign failed:', err);
    return res.status(500).json({ error: err?.message || 'Presign failed' });
  }
}
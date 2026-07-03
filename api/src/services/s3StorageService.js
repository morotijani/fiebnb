const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

class S3StorageService {
  constructor() {
    this.s3Client = new S3Client({
      endpoint: process.env.S3_ENDPOINT, // e.g. https://<account_id>.r2.cloudflarestorage.com
      region: process.env.S3_REGION || 'auto', // Cloudflare R2 uses 'auto'
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || 'dummy_access_key',
        secretAccessKey: process.env.S3_SECRET_KEY || 'dummy_secret_key',
      },
      // R2 requires path style endpoint
      forcePathStyle: true,
    });

    this.publicBucket = process.env.S3_PUBLIC_BUCKET || 'fiebnb-public';
    this.privateBucket = process.env.S3_PRIVATE_BUCKET || 'fiebnb-private';
    this.cdnBaseUrl = process.env.CDN_BASE_URL || 'https://cdn.fiebnb.com';
  }

  /**
   * Generates a Presigned PUT URL for uploading files.
   * @param {string} objectKey - The unique file name/path
   * @param {string} fileType - MIME type
   * @param {string} bucketType - 'PUBLIC_PROPERTY' or 'PRIVATE_EVIDENCE'
   * @returns {Promise<string>}
   */
  async generateUploadUrl(objectKey, fileType, bucketType) {
    const bucket = bucketType === 'PUBLIC_PROPERTY' ? this.publicBucket : this.privateBucket;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      ContentType: fileType,
    });

    // URL valid for 5 minutes
    const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 300 });
    return signedUrl;
  }

  /**
   * Generates a Presigned GET URL for viewing private files.
   * @param {string} objectKey - The unique file name/path
   * @returns {Promise<string>}
   */
  async generateReadUrl(objectKey) {
    const command = new GetObjectCommand({
      Bucket: this.privateBucket,
      Key: objectKey,
    });

    // URL valid for 15 minutes
    const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn: 900 });
    return signedUrl;
  }

  /**
   * Helper to construct the predictable CDN URL for public files.
   * @param {string} objectKey
   * @returns {string}
   */
  getPublicCdnUrl(objectKey) {
    // Assuming the CDN is pointing directly at the public bucket root
    return `${this.cdnBaseUrl}/${objectKey}`;
  }
}

module.exports = new S3StorageService();

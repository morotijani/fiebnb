const s3StorageService = require('../services/s3StorageService');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

exports.getUploadUrl = async (req, res) => {
  try {
    const { fileName, fileType, bucketType } = req.body;

    if (!fileName || !fileType || !bucketType) {
      return res.status(400).json({ error: 'fileName, fileType, and bucketType are required' });
    }

    if (!['PUBLIC_PROPERTY', 'PRIVATE_EVIDENCE'].includes(bucketType)) {
      return res.status(400).json({ error: 'Invalid bucketType' });
    }

    // Generate a unique object key to prevent collisions
    const extension = path.extname(fileName);
    const uniqueFileName = `${uuidv4()}${extension}`;
    
    // Organize by folder based on type
    const folder = bucketType === 'PUBLIC_PROPERTY' ? 'properties/' : 'evidence/';
    const objectKey = `${folder}${uniqueFileName}`;

    // Generate the presigned PUT URL
    const uploadUrl = await s3StorageService.generateUploadUrl(objectKey, fileType, bucketType);

    const responsePayload = {
      uploadUrl,
      objectKey, // Client should save this to the DB if it's private
    };

    // If it's a public property photo, provide the predictable CDN URL
    if (bucketType === 'PUBLIC_PROPERTY') {
      responsePayload.publicUrl = s3StorageService.getPublicCdnUrl(objectKey);
    }

    res.status(200).json(responsePayload);
  } catch (error) {
    console.error('Error generating upload URL:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

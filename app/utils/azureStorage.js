import { BlobServiceClient, generateBlobSASQueryParameters, BlobSASPermissions, StorageSharedKeyCredential } from '@azure/storage-blob';
import logger from './logger.js';

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_CONTAINER_NAME || 'resumes';
const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;

if (!connectionString || !accountName || !accountKey) {
  throw new Error('Azure Storage credentials not found in environment variables');
}

const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

export const uploadFileToAzure = async (file, fileName) => {
  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Create container as PRIVATE (no public access)
    await containerClient.createIfNotExists();

    const fileYear = new Date().getFullYear();
    
    // Create the full blob path: year/filename
    const blobPath = `${fileYear}/${fileName}`;
    
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

    await blockBlobClient.upload(file.buffer, file.buffer.length, {
      blobHTTPHeaders: {
        blobContentType: file.mimetype
      }
    });

    logger.info(`File uploaded successfully to: ${blobPath}`);
    return blobPath; // Return full path including year folder
  } catch (error) {
    logger.error('Error uploading file to Azure:', error);
    throw error;
  }
};

export const generateTemporaryUrl = async (blobPath, expiresInMinutes = 15) => {
  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

    const expiresOn = new Date();
    expiresOn.setMinutes(expiresOn.getMinutes() + expiresInMinutes);

    const sasToken = generateBlobSASQueryParameters({
      containerName,
      blobName: blobPath, // Use full blob path
      permissions: BlobSASPermissions.parse("r"), // read only
      startsOn: new Date(),
      expiresOn: expiresOn,
    }, sharedKeyCredential).toString();

    const temporaryUrl = `${blockBlobClient.url}?${sasToken}`;

    logger.info(`Generated temporary URL for ${blobPath}, expires in ${expiresInMinutes} minutes`);
    return {
      url: temporaryUrl,
      expiresAt: expiresOn,
      expiresInMinutes
    };
  } catch (error) {
    logger.error('Error generating temporary URL:', error);
    throw error;
  }
};

export const deleteFileFromAzure = async (blobPath) => {
  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

    await blockBlobClient.delete();
    logger.info(`File deleted successfully: ${blobPath}`);
  } catch (error) {
    logger.error('Error deleting file from Azure:', error);
    throw error;
  }
}; 

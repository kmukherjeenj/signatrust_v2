import { config } from 'dotenv';
import { QueueServiceClient } from '@azure/storage-queue';
import { SolanaDIDService } from './services/SolanaDIDService.js';
import logger from './utils/logger.js';
import { config as appConfig } from './config/config.js';
config();
logger.info('Worker script started');
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!connectionString) {
    logger.error('AZURE_STORAGE_CONNECTION_STRING is not set in the environment variables');
    process.exit(1);
}
const queueServiceClient = QueueServiceClient.fromConnectionString(connectionString);
const queueClient = queueServiceClient.getQueueClient('identity-tasks');
const solanaDIDService = new SolanaDIDService(appConfig.solana.rpcUrl, appConfig.solana.programId);
async function processMessage(messageText) {
    try {
        const task = JSON.parse(Buffer.from(messageText, 'base64').toString());
        logger.info('Processing task:', task);
        switch (task.type) {
            case 'create_did':
                await handleCreateDID();
                break;
            case 'update_did':
                await handleUpdateDID(task);
                break;
            case 'deactivate_did':
                await handleDeactivateDID(task);
                break;
            default:
                logger.warn(`Unknown task type: ${task.type}`);
        }
    }
    catch (error) {
        logger.error('Error processing message:', error);
    }
}
async function handleCreateDID() {
    if (appConfig.solana.payerKeypair) {
        const result = await solanaDIDService.createDID(appConfig.solana.payerKeypair);
        logger.info('DID created:', result);
    }
    else {
        logger.error('Payer keypair is not available');
    }
}
async function handleUpdateDID(task) {
    if (appConfig.solana.payerKeypair) {
        const result = await solanaDIDService.updateDID(task.did, appConfig.solana.payerKeypair, task.updateData);
        logger.info('DID updated:', result);
    }
    else {
        logger.error('Payer keypair is not available');
    }
}
async function handleDeactivateDID(task) {
    if (appConfig.solana.payerKeypair) {
        const result = await solanaDIDService.deactivateDID(task.did, appConfig.solana.payerKeypair);
        logger.info('DID deactivated:', result);
    }
    else {
        logger.error('Payer keypair is not available');
    }
}
async function worker() {
    logger.info('Worker function started');
    while (true) {
        try {
            logger.info('Checking for messages...');
            const response = await queueClient.receiveMessages();
            for (const message of response.receivedMessageItems) {
                try {
                    await processMessage(message.messageText);
                    await queueClient.deleteMessage(message.messageId, message.popReceipt);
                    logger.info('Message processed and deleted');
                }
                catch (error) {
                    logger.error('Error processing message:', error);
                }
            }
        }
        catch (error) {
            logger.error('Error receiving messages:', error);
        }
        await new Promise(resolve => setTimeout(resolve, 5000));
    }
}
worker().catch(error => {
    logger.error('Worker error:', error);
    process.exit(1);
});

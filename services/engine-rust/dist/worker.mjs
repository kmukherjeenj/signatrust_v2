import { config } from 'dotenv';
import { QueueServiceClient } from '@azure/storage-queue';
import logger from './config/logger.js';
// Load environment variables
config();
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
if (!connectionString) {
    logger.error('AZURE_STORAGE_CONNECTION_STRING is not set in the environment variables');
    process.exit(1);
}
const queueServiceClient = QueueServiceClient.fromConnectionString(connectionString);
const queueClient = queueServiceClient.getQueueClient('identity-tasks');
async function processMessage(messageText) {
    try {
        const task = JSON.parse(Buffer.from(messageText, 'base64').toString());
        logger.info('Processing task:', task);
        // Implement your task processing logic here
    }
    catch (error) {
        logger.error('Error processing message:', error);
    }
}
async function worker() {
    while (true) {
        try {
            const response = await queueClient.receiveMessages();
            for (const message of response.receivedMessageItems) {
                try {
                    await processMessage(message.messageText);
                    await queueClient.deleteMessage(message.messageId, message.popReceipt);
                }
                catch (error) {
                    logger.error('Error processing message:', error);
                }
            }
        }
        catch (error) {
            logger.error('Error receiving messages:', error);
        }
        // Wait for a short time before checking for new messages
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}
worker().catch(error => {
    logger.error('Worker error:', error);
    process.exit(1);
});

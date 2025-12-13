import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
export const sendSignatureRequestEmail = async (email, signatureId) => {
    try {
        await transporter.sendMail({
            from: '"Signatrust" <noreply@signatrust.com>',
            to: email,
            subject: 'Signature Request',
            html: `You have been requested to sign a document. Please click <a href="http://yourdomain.com/sign/${signatureId}">here</a> to view and sign the document.`,
        });
        logger.info(`Signature request email sent to ${email} for signature ID ${signatureId}`);
    }
    catch (error) {
        logger.error('Failed to send signature request email', { error, email, signatureId });
        throw new Error('Failed to send signature request email');
    }
};
export const notifyAllParties = async (signatureId) => {
    try {
        // In a real implementation, you would retrieve all parties' emails from your database
        // For now, we'll just log it
        logger.info(`Notifying all parties for completed signature ${signatureId}`);
    }
    catch (error) {
        logger.error('Failed to notify all parties', { error, signatureId });
        throw new Error('Failed to notify all parties');
    }
};

// services/NotificationService.ts

import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

export class NotificationService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendSigningRequest(signer: string, documentHash: string, workflowId: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: '"Signatrust" <noreply@signatrust.com>',
        to: signer,
        subject: 'Signature Request',
        html: `You have been requested to sign a document (${documentHash}). Please click <a href="http://yourdomain.com/sign/${workflowId}">here</a> to view and sign the document.`,
      });
      logger.info(`Signature request email sent to ${signer} for document ${documentHash} in workflow ${workflowId}`);
    } catch (error) {
      logger.error('Failed to send signature request email', { error, signer, documentHash, workflowId });
      throw new Error('Failed to send signature request email');
    }
  }

  async sendSignatureComplete(signer: string, documentHash: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: '"Signatrust" <noreply@signatrust.com>',
        to: signer,
        subject: 'Document Signed',
        html: `You have successfully signed the document (${documentHash}).`,
      });
      logger.info(`Signature completion email sent to ${signer} for document ${documentHash}`);
    } catch (error) {
      logger.error('Failed to send signature completion email', { error, signer, documentHash });
      throw new Error('Failed to send signature completion email');
    }
  }

  async sendWorkflowComplete(participants: string[], documentHash: string): Promise<void> {
    try {
      for (const participant of participants) {
        await this.transporter.sendMail({
          from: '"Signatrust" <noreply@signatrust.com>',
          to: participant,
          subject: 'Document Fully Signed',
          html: `The document (${documentHash}) has been fully signed by all parties.`,
        });
      }
      logger.info(`Workflow completion email sent to all participants for document ${documentHash}`);
    } catch (error) {
      logger.error('Failed to send workflow completion email', { error, documentHash });
      throw new Error('Failed to send workflow completion email');
    }
  }

  // You can keep the existing functions as static methods if needed
  static async sendSignatureRequestEmail(email: string, signatureId: string): Promise<void> {
    // ... existing implementation ...
  }

  static async notifyAllParties(signatureId: string): Promise<void> {
    // ... existing implementation ...
  }
}
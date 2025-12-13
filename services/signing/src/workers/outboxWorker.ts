import { prisma } from '../adapters/prisma.js';
import { createSolanaClient } from '../services/solanaClient.js';
import { KeypairManager } from '../services/keypairManager.js';
import { PublicKey } from '@solana/web3.js';

/**
 * Outbox event types
 */
type OutboxEventType =
  | 'blockchain.create_document'
  | 'blockchain.add_signature'
  | 'blockchain.finalize_document'
  | 'blockchain.cancel_document';

/**
 * Outbox event payload structures
 */
interface CreateDocumentPayload {
  sessionId: string;
  documentHash: string;
  signerDIDs: string[];
  creatorDID: string;
}

interface AddSignaturePayload {
  sessionId: string;
  documentAccountPubkey?: string; // Optional - will be looked up from session if not provided
  signerDID: string;
  signatureData: string; // Hex-encoded 64-byte signature
}

interface FinalizeDocumentPayload {
  sessionId: string;
  documentAccountPubkey?: string; // Optional - will be looked up from session if not provided
}

interface CancelDocumentPayload {
  sessionId: string;
  creatorDID: string;
}

type OutboxPayload = CreateDocumentPayload | AddSignaturePayload | FinalizeDocumentPayload | CancelDocumentPayload;

/**
 * Retry configuration
 */
interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;     // milliseconds
  maxDelay: number;          // milliseconds
  backoffMultiplier: number; // exponential backoff multiplier
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 5,
  initialDelay: 1000,    // 1 second
  maxDelay: 60000,       // 1 minute
  backoffMultiplier: 2,  // 2x backoff
};

/**
 * Outbox Worker
 * Processes pending blockchain events from the Outbox table
 */
export class OutboxWorker {
  private solanaClient: ReturnType<typeof createSolanaClient>;
  private isRunning: boolean = false;
  private pollInterval: number = 5000; // 5 seconds
  private batchSize: number = 10;
  private retryConfig: RetryConfig;

  constructor(retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG) {
    this.solanaClient = createSolanaClient();
    this.retryConfig = retryConfig;
  }

  /**
   * Start the worker
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('Outbox worker is already running');
      return;
    }

    this.isRunning = true;
    console.log('Starting outbox worker...');

    // Run initial poll
    await this.poll();

    // Start polling interval
    const intervalId = setInterval(async () => {
      if (!this.isRunning) {
        clearInterval(intervalId);
        return;
      }
      await this.poll();
    }, this.pollInterval);
  }

  /**
   * Stop the worker
   */
  stop(): void {
    console.log('Stopping outbox worker...');
    this.isRunning = false;
  }

  /**
   * Poll for pending events
   */
  private async poll(): Promise<void> {
    try {
      // Fetch pending events (not processed and within retry limits)
      const events = await prisma.outbox.findMany({
        where: {
          processedAt: null,
          attemptCount: {
            lt: this.retryConfig.maxAttempts,
          },
        },
        orderBy: {
          occurredAt: 'asc',
        },
        take: this.batchSize,
      });

      if (events.length === 0) {
        return;
      }

      console.log(`Processing ${events.length} outbox events`);

      // Process each event
      for (const event of events) {
        await this.processEvent(event);
      }
    } catch (error) {
      console.error('Error polling outbox:', error);
    }
  }

  /**
   * Process a single outbox event
   */
  private async processEvent(event: any): Promise<void> {
    const eventId = event.id;
    const eventType = event.type as OutboxEventType;
    const payload = event.payload as OutboxPayload;
    const attemptCount = event.attemptCount;

    try {
      console.log(`Processing event ${eventId} (type: ${eventType}, attempt: ${attemptCount + 1})`);

      // Route to appropriate handler
      let result: { success: boolean; txSignature?: string; error?: string };

      switch (eventType) {
        case 'blockchain.create_document':
          result = await this.handleCreateDocument(payload as CreateDocumentPayload);
          break;
        case 'blockchain.add_signature':
          result = await this.handleAddSignature(payload as AddSignaturePayload);
          break;
        case 'blockchain.finalize_document':
          result = await this.handleFinalizeDocument(payload as FinalizeDocumentPayload);
          break;
        case 'blockchain.cancel_document':
          result = await this.handleCancelDocument(payload as CancelDocumentPayload);
          break;
        default:
          throw new Error(`Unknown event type: ${eventType}`);
      }

      if (result.success) {
        // Mark as processed
        await prisma.outbox.update({
          where: { id: eventId },
          data: {
            processedAt: new Date(),
            attemptCount: attemptCount + 1,
          },
        });

        console.log(`Event ${eventId} processed successfully. TX: ${result.txSignature}`);

        // Update session with chain record ONLY for create_document events
        // create_document stores the document account pubkey which is needed for subsequent operations
        if (eventType === 'blockchain.create_document' && 'sessionId' in payload) {
          const documentAccountPubkey = (result as any).documentAccountPubkey;
          if (documentAccountPubkey) {
            await this.updateSessionChainRecord(payload.sessionId, documentAccountPubkey);
          }
        }
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
      console.error(`Error processing event ${eventId}:`, error);

      // Increment attempt count
      const newAttemptCount = attemptCount + 1;

      if (newAttemptCount >= this.retryConfig.maxAttempts) {
        console.error(`Event ${eventId} exceeded max attempts (${this.retryConfig.maxAttempts})`);
      }

      await prisma.outbox.update({
        where: { id: eventId },
        data: {
          attemptCount: newAttemptCount,
        },
      });

      // Calculate retry delay with exponential backoff
      const delay = this.calculateRetryDelay(newAttemptCount);
      console.log(`Will retry event ${eventId} in ${delay}ms`);
    }
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private calculateRetryDelay(attemptCount: number): number {
    const delay = this.retryConfig.initialDelay * Math.pow(this.retryConfig.backoffMultiplier, attemptCount - 1);
    return Math.min(delay, this.retryConfig.maxDelay);
  }

  /**
   * Handle create document event
   */
  private async handleCreateDocument(
    payload: CreateDocumentPayload
  ): Promise<{ success: boolean; txSignature?: string; documentAccountPubkey?: string; error?: string }> {
    try {
      const { documentHash, signerDIDs, creatorDID } = payload;

      const result = await this.solanaClient.createDocument(
        documentHash,
        signerDIDs,
        creatorDID
      );

      return {
        success: true,
        txSignature: result.signature,
        documentAccountPubkey: result.documentAccount.toBase58(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Handle add signature event
   */
  private async handleAddSignature(
    payload: AddSignaturePayload
  ): Promise<{ success: boolean; txSignature?: string; error?: string }> {
    try {
      const { sessionId, signerDID, signatureData } = payload;
      let { documentAccountPubkey } = payload;

      // If documentAccountPubkey not provided, look it up from session
      if (!documentAccountPubkey) {
        const session = await prisma.signingSession.findUnique({
          where: { id: sessionId },
        });
        if (!session?.chainRecord) {
          return {
            success: false,
            error: 'Session chainRecord not yet available - will retry',
          };
        }
        documentAccountPubkey = session.chainRecord;
      }

      const signature = await this.solanaClient.signDocument(
        new PublicKey(documentAccountPubkey),
        signerDID,
        Buffer.from(signatureData, 'hex')
      );

      return {
        success: true,
        txSignature: signature,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Handle finalize document event
   */
  private async handleFinalizeDocument(
    payload: FinalizeDocumentPayload
  ): Promise<{ success: boolean; txSignature?: string; error?: string }> {
    try {
      const { sessionId } = payload;
      let { documentAccountPubkey } = payload;

      // If documentAccountPubkey not provided, look it up from session
      if (!documentAccountPubkey) {
        const session = await prisma.signingSession.findUnique({
          where: { id: sessionId },
        });
        if (!session?.chainRecord) {
          return {
            success: false,
            error: 'Session chainRecord not yet available - will retry',
          };
        }
        documentAccountPubkey = session.chainRecord;
      }

      // Verify all signers have signed
      const isFullySigned = await this.solanaClient.isDocumentFullySigned(
        new PublicKey(documentAccountPubkey)
      );

      if (!isFullySigned) {
        return {
          success: false,
          error: 'Document is not fully signed on-chain',
        };
      }

      return {
        success: true,
        txSignature: documentAccountPubkey, // Use document account as reference
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Handle cancel document event
   */
  private async handleCancelDocument(
    payload: CancelDocumentPayload
  ): Promise<{ success: boolean; txSignature?: string; error?: string }> {
    try {
      const { sessionId, creatorDID } = payload;

      // Look up session to get chainRecord
      const session = await prisma.signingSession.findUnique({
        where: { id: sessionId },
      });

      if (!session?.chainRecord) {
        return {
          success: false,
          error: 'Session chainRecord not available - will retry',
        };
      }

      // Import DocumentStatus from solanaClient
      const { DocumentStatus } = await import('../services/solanaClient.js');

      // Call updateStatus with Cancelled status
      const signature = await this.solanaClient.updateStatus(
        new PublicKey(session.chainRecord),
        creatorDID,
        DocumentStatus.Cancelled
      );

      // Update session with cancel chain tx
      await prisma.signingSession.update({
        where: { id: sessionId },
        data: { cancelChainTx: signature },
      });

      return {
        success: true,
        txSignature: signature,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Update signing session with blockchain transaction signature
   */
  private async updateSessionChainRecord(sessionId: string, txSignature: string): Promise<void> {
    try {
      await prisma.signingSession.update({
        where: { id: sessionId },
        data: {
          chainRecord: txSignature,
        },
      });
    } catch (error) {
      console.error(`Failed to update session ${sessionId} with chain record:`, error);
    }
  }

  /**
   * Get worker status
   */
  getStatus(): { isRunning: boolean; pollInterval: number; batchSize: number } {
    return {
      isRunning: this.isRunning,
      pollInterval: this.pollInterval,
      batchSize: this.batchSize,
    };
  }

  /**
   * Get pending event count
   */
  async getPendingCount(): Promise<number> {
    return prisma.outbox.count({
      where: {
        processedAt: null,
        attemptCount: {
          lt: this.retryConfig.maxAttempts,
        },
      },
    });
  }

  /**
   * Get failed event count (exceeded max attempts)
   */
  async getFailedCount(): Promise<number> {
    return prisma.outbox.count({
      where: {
        processedAt: null,
        attemptCount: {
          gte: this.retryConfig.maxAttempts,
        },
      },
    });
  }
}

/**
 * Global worker instance
 */
let workerInstance: OutboxWorker | null = null;

/**
 * Get or create the global outbox worker
 */
export function getOutboxWorker(): OutboxWorker {
  if (!workerInstance) {
    workerInstance = new OutboxWorker();
  }
  return workerInstance;
}

/**
 * Start the outbox worker
 */
export async function startOutboxWorker(): Promise<void> {
  const worker = getOutboxWorker();
  await worker.start();
}

/**
 * Stop the outbox worker
 */
export function stopOutboxWorker(): void {
  if (workerInstance) {
    workerInstance.stop();
  }
}

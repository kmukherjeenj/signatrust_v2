// services/WorkflowManagementService.ts
import { SolanaDIDService } from './SolanaDIDService.ts';
import { NotificationService } from './NotificationService.ts';

export class WorkflowManagementService {
  private solanaDIDService: SolanaDIDService;
  private notificationService: NotificationService;

  constructor() {
    this.solanaDIDService = new SolanaDIDService();
    this.notificationService = new NotificationService();
  }

  async createSigningWorkflow(documentHash: string, signers: string[], deadline: Date): Promise<string> {
    const workflowId = await this.solanaDIDService.createSigningWorkflow(documentHash, signers, deadline.getTime());
    await this.notifySigners(signers, documentHash, workflowId);
    return workflowId;
  }

  async getWorkflowStatus(workflowId: string): Promise<any> {
    return this.solanaDIDService.getWorkflowStatus(workflowId);
  }

  private async notifySigners(signers: string[], documentHash: string, workflowId: string): Promise<void> {
    for (const signer of signers) {
      await this.notificationService.sendSigningRequest(signer, documentHash, workflowId);
    }
  }
}
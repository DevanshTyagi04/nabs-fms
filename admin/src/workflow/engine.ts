import { WorkflowStatusDefinition } from './statusDefinitions';

export interface WorkflowTransitionRule {
  from: string;
  to: string;
  label: string;
  allowedRoles?: string[];
}

export class WorkflowStateMachine {
  private statusDefinitions: Record<string, WorkflowStatusDefinition>;

  constructor(statusDefinitions: Record<string, WorkflowStatusDefinition>) {
    this.statusDefinitions = statusDefinitions;
  }

  public getStatusDefinition(status: string): WorkflowStatusDefinition | undefined {
    return this.statusDefinitions[status];
  }

  public canTransition(fromStatus: string, toStatus: string): boolean {
    const current = this.getStatusDefinition(fromStatus);
    if (!current || current.terminal) return false;
    return current.allowedTransitions.includes(toStatus);
  }

  public getAvailableTransitions(fromStatus: string, userRole?: string): string[] {
    const current = this.getStatusDefinition(fromStatus);
    if (!current || current.terminal) return [];
    return current.allowedTransitions;
  }
}

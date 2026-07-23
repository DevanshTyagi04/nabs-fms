import { UserRole } from '@packages/shared-types';

export class WorkflowPermissionService {
  static canAssign(role?: UserRole | null, currentStatus?: string): boolean {
    if (role === 'ADMIN') {
      return currentStatus === 'CREATED' || currentStatus === 'ASSIGNED';
    }
    return false;
  }

  static canTransition(role?: UserRole | null, fromStatus?: string, toStatus?: string): boolean {
    if (!role || !fromStatus || !toStatus) return false;

    if (role === 'ADMIN') return true;

    if (role === 'VENDOR') {
      if (fromStatus === 'ASSIGNED' && (toStatus === 'IN_PROGRESS' || toStatus === 'CREATED')) return true;
      if (fromStatus === 'IN_PROGRESS' && toStatus === 'COMPLETED') return true;
    }

    if (role === 'CUSTOMER') {
      if ((fromStatus === 'CREATED' || fromStatus === 'ASSIGNED') && toStatus === 'CANCELLED') return true;
    }

    return false;
  }

  static canCancel(role?: UserRole | null, currentStatus?: string): boolean {
    if (currentStatus === 'COMPLETED' || currentStatus === 'CANCELLED') return false;
    if (role === 'ADMIN') return true;
    if (role === 'CUSTOMER') return currentStatus === 'CREATED' || currentStatus === 'ASSIGNED';
    return false;
  }

  static canEdit(role?: UserRole | null, currentStatus?: string): boolean {
    if (role === 'ADMIN') return true;
    if (role === 'CUSTOMER') return currentStatus === 'CREATED';
    return false;
  }
}

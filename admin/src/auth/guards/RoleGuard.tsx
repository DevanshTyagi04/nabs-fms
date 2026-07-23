'use client';

import React from 'react';
import { UserRole } from '@packages/shared-types';
import { useAuth } from '../hooks/useAuth';
import { hasRole } from '../utils';
import { ErrorState } from '@/components/feedback/States';

export interface RoleGuardProps {
  roles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RoleGuard({ roles, children, fallback }: RoleGuardProps) {
  const { role } = useAuth();

  if (!hasRole(role || undefined, roles)) {
    if (fallback) return <>{fallback}</>;
    return (
      <div className="p-6">
        <ErrorState
          title="Access Denied"
          description={`Your account role (${role || 'UNKNOWN'}) does not have permission to view this page.`}
        />
      </div>
    );
  }

  return <>{children}</>;
}

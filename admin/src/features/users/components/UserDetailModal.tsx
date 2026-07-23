'use client';

import React from 'react';
import { EntityDetailModal, EntityHeader, DetailSection } from '@/components/crud/EntityDetailLayout';
import { Badge } from '@/components/ui/Badge';
import { User } from '../types';

export interface UserDetailModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

export function UserDetailModal({ open, onClose, user }: UserDetailModalProps) {
  if (!user) return null;

  const displayName = user.firstName
    ? `${user.firstName} ${user.lastName || ''}`
    : user.email;

  return (
    <EntityDetailModal
      open={open}
      onClose={onClose}
      title="User Account Details"
      header={
        <EntityHeader
          title={displayName}
          subtitle={`Account ID: ${user.id}`}
          avatarName={displayName}
          badge={
            <Badge
              variant={user.status === 'ACTIVE' ? 'success' : 'warning'}
              size="sm"
              dot
            >
              {user.status}
            </Badge>
          }
        />
      }
    >
      <div className="space-y-4">
        <DetailSection
          title="Account Overview"
          fields={[
            { label: 'Email Address', value: user.email },
            { label: 'Phone Number', value: user.phone || 'Not Provided' },
            { label: 'Account Role', value: <Badge variant="primary">{user.role}</Badge> },
            { label: 'Account Status', value: user.status },
          ]}
        />

        <DetailSection
          title="Profile Information"
          fields={[
            { label: 'First Name', value: user.firstName || 'N/A' },
            { label: 'Last Name', value: user.lastName || 'N/A' },
            { label: 'Company / Business', value: user.companyName || user.businessName || 'N/A' },
            { label: 'Department', value: user.department || 'N/A' },
          ]}
        />

        <DetailSection
          title="System Timestamps"
          fields={[
            { label: 'Account Created', value: new Date(user.createdAt).toLocaleDateString() },
            { label: 'Last Active Session', value: user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never' },
          ]}
        />
      </div>
    </EntityDetailModal>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { EntityFormDialog } from '@/components/crud/EntityFormDialog';
import { Input } from '@/components/ui/Input';
import { FormField, FormLabel } from '@/components/forms/FormField';
import { User, CreateUserDto, UpdateUserDto } from '../types';
import { UserRole } from '@packages/shared-types';

export interface UserFormDialogProps {
  open: boolean;
  onClose: () => void;
  userToEdit?: User | null;
  loading?: boolean;
  error?: string | null;
  onSubmit: (dto: CreateUserDto | UpdateUserDto) => Promise<void>;
}

export function UserFormDialog({
  open,
  onClose,
  userToEdit,
  loading = false,
  error,
  onSubmit,
}: UserFormDialogProps) {
  const isEditing = Boolean(userToEdit);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('CUSTOMER');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [department, setDepartment] = useState('');

  useEffect(() => {
    if (userToEdit) {
      setEmail(userToEdit.email);
      setPhone(userToEdit.phone || '');
      setRole(userToEdit.role);
      setFirstName(userToEdit.firstName || '');
      setLastName(userToEdit.lastName || '');
      setCompanyName(userToEdit.companyName || userToEdit.businessName || '');
      setDepartment(userToEdit.department || '');
    } else {
      setEmail('');
      setPassword('');
      setPhone('');
      setRole('CUSTOMER');
      setFirstName('');
      setLastName('');
      setCompanyName('');
      setDepartment('');
    }
  }, [userToEdit, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      await onSubmit({
        firstName,
        lastName,
        phone,
        companyName,
        department,
      });
    } else {
      await onSubmit({
        email,
        password,
        phone,
        role,
        firstName,
        lastName,
        companyName,
        department,
      });
    }
  };

  return (
    <EntityFormDialog
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit User Account' : 'Create New User Account'}
      description={isEditing ? 'Update profile information and system metadata' : 'Provision a new user account across platform roles'}
      loading={loading}
      error={error}
      onSubmit={handleSubmit}
      submitLabel={isEditing ? 'Save Changes' : 'Create User'}
    >
      <div className="space-y-3">
        {!isEditing && (
          <Input
            label="Email Address"
            type="email"
            placeholder="user@nabs.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        )}

        {!isEditing && (
          <Input
            label="Password"
            type="password"
            placeholder="Minimum 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        )}

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First Name"
            placeholder="Jane"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={loading}
          />
          <Input
            label="Last Name"
            placeholder="Doe"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            disabled={loading}
          />
        </div>

        <Input
          label="Phone Number"
          placeholder="+1 (555) 000-0000"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={loading}
        />

        {!isEditing && (
          <FormField>
            <FormLabel required>Account Role</FormLabel>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full h-10 px-3 text-xs rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 cursor-pointer"
              disabled={loading}
            >
              <option value="CUSTOMER">Customer</option>
              <option value="VENDOR">Vendor / Contractor</option>
              <option value="ADMIN">System Administrator</option>
            </select>
          </FormField>
        )}

        {role === 'CUSTOMER' && (
          <Input
            label="Company Name"
            placeholder="Acme Corp"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            disabled={loading}
          />
        )}

        {role === 'ADMIN' && (
          <Input
            label="Department"
            placeholder="Platform Support"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            disabled={loading}
          />
        )}
      </div>
    </EntityFormDialog>
  );
}

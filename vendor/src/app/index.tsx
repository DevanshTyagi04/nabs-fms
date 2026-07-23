import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MobileLayout } from '@/components/layout/Layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Spinner } from '@/components/ui/Spinner';
import { Skeleton } from '@/components/ui/Skeleton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Dialog } from '@/components/ui/Dialog';
import { Icon } from '@/components/ui/Icon';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { EmptyState, ErrorState, OfflineState } from '@/components/feedback/States';
import { useToast } from '@/hooks/useToast';
import { useTheme } from '@/hooks/useTheme';
import { VENDOR_TABS } from '@/constants';
import { getStatusBadgeVariant } from '@/utils/formatters';
import { ProtectedRoute } from '@/auth/guards/ProtectedRoute';
import { RoleGuard } from '@/auth/guards/RoleGuard';
import { useAuth } from '@/auth/hooks/useAuth';

export default function VendorDesignSystemShowcase() {
  const { resolvedMode, toggleTheme, colors } = useTheme();
  const { user, role, permissions, logout } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('home');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [progressVal, setProgressVal] = useState(70);

  return (
    <ProtectedRoute>
      <RoleGuard roles={['VENDOR']}>
        <MobileLayout
          title="Vendor Mobile Console"
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={VENDOR_TABS}
          rightAction={
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <TouchableOpacity onPress={toggleTheme} style={styles.themeBtn}>
                <Icon name={resolvedMode === 'dark' ? 'sun' : 'moon'} size="md" color="primary" />
              </TouchableOpacity>
              <TouchableOpacity onPress={logout} style={styles.themeBtn}>
                <Icon name="x" size="md" color="error" />
              </TouchableOpacity>
            </View>
          }
        >
          {/* Banner */}
          <View style={[styles.banner, { backgroundColor: colors.primary }]}>
            <Badge variant="primary" dot style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
              Phase 2 Authenticated
            </Badge>
            <Text style={[styles.bannerTitle, { color: colors.primaryForeground }]}>
              Welcome, {user?.firstName || user?.email || 'Vendor'}
            </Text>
            <Text style={[styles.bannerSubtitle, { color: colors.primaryForeground }]}>
              Logged in as {user?.email} (Role: {role}, Permissions: {permissions.join(', ')})
            </Text>
          </View>

          <OfflineState />

          {/* User Auth Context */}
          <Card>
            <CardHeader>
              <CardTitle>Authenticated Session Context</CardTitle>
              <CardDescription>Live user context from /api/v1/auth/me via NabsClient</CardDescription>
            </CardHeader>
            <CardContent style={{ gap: 6 }}>
              <Text style={{ fontSize: 12, color: colors.mutedForeground }}>ID: {user?.id}</Text>
              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.cardForeground }}>Email: {user?.email}</Text>
              <View style={styles.rowWrap}>
                <Badge variant="primary" dot>Role: {role || 'VENDOR'}</Badge>
                <Badge variant="success" dot>Status: {user?.status || 'ACTIVE'}</Badge>
              </View>
            </CardContent>
          </Card>

          {/* Theme Tokens */}
          <Card>
            <CardHeader>
              <CardTitle>Semantic Color Tokens</CardTitle>
              <CardDescription>Pure semantic tokens consumed across all native screens.</CardDescription>
            </CardHeader>
            <CardContent style={styles.tokenGrid}>
              {Object.entries(colors).slice(0, 10).map(([token, hex]) => (
                <View key={token} style={[styles.tokenCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <View style={[styles.colorBox, { backgroundColor: hex as string }]} />
                  <Text style={[styles.tokenName, { color: colors.cardForeground }]}>{token}</Text>
                </View>
              ))}
            </CardContent>
          </Card>

          {/* Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Buttons & Variants</CardTitle>
            </CardHeader>
            <CardContent style={{ gap: 10 }}>
              <Button variant="primary">Primary Action</Button>
              <Button variant="danger" onPress={logout}>Sign Out</Button>
            </CardContent>
          </Card>

          {/* Dialogs */}
          <Dialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            title="Native Mobile Dialog"
            description="Accessible modal overlay for vendor actions."
            footer={
              <Button variant="primary" onPress={() => setDialogOpen(false)}>
                Close Modal
              </Button>
            }
          >
            <Text style={{ color: colors.cardForeground, fontSize: 13 }}>
              This component operates seamlessly across iOS, Android, and Web using Expo Router.
            </Text>
          </Dialog>

          <ConfirmDialog
            open={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            onConfirm={() => {
              setConfirmOpen(false);
              toast.success('Action Confirmed', 'Vendor status updated.');
            }}
            title="Confirm Dispatch Rejection"
            description="Are you sure you want to decline this job dispatch?"
          />
        </MobileLayout>
      </RoleGuard>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  themeBtn: {
    padding: 6,
  },
  banner: {
    padding: 16,
    borderRadius: 12,
    gap: 6,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  bannerSubtitle: {
    fontSize: 12,
    opacity: 0.9,
  },
  tokenGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tokenCard: {
    width: '48%',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
  },
  colorBox: {
    height: 24,
    borderRadius: 4,
  },
  tokenName: {
    fontSize: 11,
    fontWeight: '600',
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
});

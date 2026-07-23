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
import { CUSTOMER_TABS } from '@/constants';
import { getStatusBadgeVariant } from '@/utils/formatters';

export default function CustomerDesignSystemShowcase() {
  const { resolvedMode, toggleTheme, colors } = useTheme();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('home');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <MobileLayout
      title="Customer App Design System Showcase"
      activeTab={activeTab}
      onTabChange={setActiveTab}
      tabs={CUSTOMER_TABS}
      rightAction={
        <TouchableOpacity onPress={toggleTheme} style={styles.themeBtn}>
          <Icon name={resolvedMode === 'dark' ? 'sun' : 'moon'} size="md" color="primary" />
        </TouchableOpacity>
      }
    >
      {/* Banner */}
      <View style={[styles.banner, { backgroundColor: colors.primary }]}>
        <Badge variant="primary" dot style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
          Phase 1 Mobile
        </Badge>
        <Text style={[styles.bannerTitle, { color: colors.primaryForeground }]}>Customer Mobile Design System</Text>
        <Text style={[styles.bannerSubtitle, { color: colors.primaryForeground }]}>
          Expo v57 Native Reusable Primitive Component Architecture
        </Text>
      </View>

      <OfflineState />

      {/* 1. Theme Tokens */}
      <Card>
        <CardHeader>
          <CardTitle>Semantic Color Tokens</CardTitle>
          <CardDescription>Shared tokens across Customer App UI components.</CardDescription>
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

      {/* 2. Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Buttons & Sizes</CardTitle>
        </CardHeader>
        <CardContent style={{ gap: 10 }}>
          <Button variant="primary" leftIcon="file-text">Book Service Request</Button>
          <Button variant="secondary">View Request History</Button>
          <Button variant="outline" rightIcon="chevron-right">Manage Saved Address</Button>
          <Button variant="danger">Cancel Booking</Button>
        </CardContent>
      </Card>

      {/* 3. Inputs */}
      <Card>
        <CardHeader>
          <CardTitle>Form Inputs</CardTitle>
        </CardHeader>
        <CardContent style={{ gap: 12 }}>
          <Input label="Account Email" placeholder="customer@nabs.com" leftIcon="mail" />
          <PasswordInput label="Customer Password" placeholder="Enter account password" />
          <Textarea label="Service Issue Description" placeholder="Describe appliance or HVAC fault..." />
        </CardContent>
      </Card>

      {/* 4. Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Status Indicators</CardTitle>
        </CardHeader>
        <CardContent style={styles.rowWrap}>
          <Badge variant={getStatusBadgeVariant('PENDING')} dot>Request: PENDING</Badge>
          <Badge variant={getStatusBadgeVariant('SCHEDULED')} dot>Request: SCHEDULED</Badge>
          <Badge variant={getStatusBadgeVariant('COMPLETED')} dot>Request: COMPLETED</Badge>
        </CardContent>
      </Card>

      {/* 5. Avatars & Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Profile & Rating</CardTitle>
        </CardHeader>
        <CardContent style={{ gap: 12 }}>
          <View style={styles.rowWrap}>
            <Avatar name="Emily Watson" size="sm" status="online" />
            <Avatar name="Robert Chen" size="md" status="online" />
          </View>
          <ProgressBar value={85} showLabel color="primary" />
        </CardContent>
      </Card>

      {/* 6. Loading States */}
      <Card>
        <CardHeader>
          <CardTitle>Loading Placeholders</CardTitle>
        </CardHeader>
        <CardContent style={{ gap: 8 }}>
          <Spinner size="md" />
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="rectangular" height={50} />
        </CardContent>
      </Card>

      {/* 7. Dialogs & Toast */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive Modals & Toasts</CardTitle>
        </CardHeader>
        <CardContent style={{ gap: 10 }}>
          <Button variant="primary" onPress={() => setDialogOpen(true)}>Open Customer Modal</Button>
          <Button variant="danger" onPress={() => setConfirmOpen(true)}>Open Cancellation Dialog</Button>
          <View style={styles.rowWrap}>
            <Button size="sm" variant="outline" onPress={() => toast.success('Booking Confirmed', 'Technician assigned.')}>Success</Button>
            <Button size="sm" variant="outline" onPress={() => toast.error('Payment Error', 'Transaction declined.')}>Error</Button>
          </View>
        </CardContent>
      </Card>

      {/* 8. States */}
      <EmptyState
        title="No Active Service Bookings"
        description="Schedule a new service request anytime."
        actionLabel="Request Service"
        onAction={() => toast.info('Booking', 'New booking wizard would launch.')}
      />

      <ErrorState
        title="Unable to Load Bookings"
        description="Could not synchronize with customer backend portal."
        onRetry={() => toast.info('Retrying Sync', 'Connecting to backend...')}
      />

      {/* Modals */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Customer App Modal"
        description="Accessible native dialog shell."
        footer={
          <Button variant="primary" onPress={() => setDialogOpen(false)}>
            Dismiss
          </Button>
        }
      >
        <Text style={{ color: colors.cardForeground, fontSize: 13 }}>
          Modular dialog foundation enforcing accessible layout standards.
        </Text>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          toast.success('Cancelled', 'Service booking was cancelled.');
        }}
        title="Confirm Cancellation"
        description="Are you sure you wish to cancel this scheduled service request?"
      />
    </MobileLayout>
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

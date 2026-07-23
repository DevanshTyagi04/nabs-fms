import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MobileLayout } from '@/components/layout/Layout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
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

export default function VendorDesignSystemShowcase() {
  const { mode, resolvedMode, toggleTheme, colors } = useTheme();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('home');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [progressVal, setProgressVal] = useState(70);

  return (
    <MobileLayout
      title="Vendor App Design System Showcase"
      activeTab={activeTab}
      onTabChange={setActiveTab}
      tabs={VENDOR_TABS}
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
        <Text style={[styles.bannerTitle, { color: colors.primaryForeground }]}>Vendor Mobile Design System</Text>
        <Text style={[styles.bannerSubtitle, { color: colors.primaryForeground }]}>
          Expo v57 Native Reusable Primitive Component Architecture
        </Text>
      </View>

      <OfflineState />

      {/* 1. Theme Tokens */}
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

      {/* 2. Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Buttons & Variants</CardTitle>
          <CardDescription>Primary, Secondary, Outline, Ghost, Danger variants.</CardDescription>
        </CardHeader>
        <CardContent style={{ gap: 10 }}>
          <Button variant="primary">Primary Action</Button>
          <Button variant="secondary">Secondary Action</Button>
          <Button variant="outline" leftIcon="briefcase">Outline with Icon</Button>
          <Button variant="danger" rightIcon="x">Danger Button</Button>
          <Button loading>Loading State</Button>
          <Button disabled>Disabled Button</Button>
        </CardContent>
      </Card>

      {/* 3. Inputs */}
      <Card>
        <CardHeader>
          <CardTitle>Form Inputs</CardTitle>
          <CardDescription>TextInput with icons, errors, and password toggle.</CardDescription>
        </CardHeader>
        <CardContent style={{ gap: 12 }}>
          <Input label="Technician Email" placeholder="vendor@nabs.com" leftIcon="mail" />
          <PasswordInput label="Vendor Access Token" placeholder="Enter password" />
          <Input label="Validation Error State" defaultValue="invalid-input" error="Invalid vendor license format." />
          <Textarea label="Job Notes" placeholder="Enter job completion notes..." />
        </CardContent>
      </Card>

      {/* 4. Badges & Domain Status */}
      <Card>
        <CardHeader>
          <CardTitle>Badges & Domain Status</CardTitle>
        </CardHeader>
        <CardContent style={styles.rowWrap}>
          <Badge variant="primary" dot>Primary</Badge>
          <Badge variant="success" dot>Success</Badge>
          <Badge variant="warning" dot>Warning</Badge>
          <Badge variant="error" dot>Error</Badge>
          <Badge variant={getStatusBadgeVariant('IN_PROGRESS')} dot>IN_PROGRESS</Badge>
          <Badge variant={getStatusBadgeVariant('COMPLETED')} dot>COMPLETED</Badge>
        </CardContent>
      </Card>

      {/* 5. Avatars & Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Avatars & Progress Indicator</CardTitle>
        </CardHeader>
        <CardContent style={{ gap: 14 }}>
          <View style={styles.rowWrap}>
            <Avatar name="Alex Mercer" size="sm" status="online" />
            <Avatar name="Jane Smith" size="md" status="away" />
            <Avatar name="Dave Miller" size="lg" status="busy" />
          </View>
          <ProgressBar value={progressVal} showLabel color="success" />
        </CardContent>
      </Card>

      {/* 6. Loading Skeletons & Spinners */}
      <Card>
        <CardHeader>
          <CardTitle>Loading States & Skeletons</CardTitle>
        </CardHeader>
        <CardContent style={{ gap: 10 }}>
          <Spinner size="md" />
          <Skeleton variant="text" width="90%" />
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="rectangular" height={60} />
        </CardContent>
      </Card>

      {/* 7. Dialogs & Toast */}
      <Card>
        <CardHeader>
          <CardTitle>Modals & Toast Notifications</CardTitle>
        </CardHeader>
        <CardContent style={{ gap: 10 }}>
          <Button variant="primary" onPress={() => setDialogOpen(true)}>Open Modal Dialog</Button>
          <Button variant="danger" onPress={() => setConfirmOpen(true)}>Open Confirm Prompt</Button>
          <View style={styles.rowWrap}>
            <Button size="sm" variant="outline" onPress={() => toast.success('Success Toast', 'Job sync completed.')}>Success</Button>
            <Button size="sm" variant="outline" onPress={() => toast.error('Error Toast', 'Location services disabled.')}>Error</Button>
            <Button size="sm" variant="outline" onPress={() => toast.warning('Warning Toast', 'Low battery level.')}>Warning</Button>
          </View>
        </CardContent>
      </Card>

      {/* 8. States */}
      <EmptyState
        title="No Assigned Service Requests"
        description="Check back later for new dispatches."
        actionLabel="Refresh Dispatches"
        onAction={() => toast.info('Refreshed', 'Dispatches updated.')}
      />

      <ErrorState
        title="GPS Connection Lost"
        description="Enable location permissions in system settings."
        onRetry={() => toast.info('Retrying GPS', 'Re-acquiring location...')}
      />

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

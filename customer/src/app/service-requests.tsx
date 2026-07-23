import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { ProtectedRoute } from '@/auth/guards/ProtectedRoute';
import { RoleGuard } from '@/auth/guards/RoleGuard';
import { useTheme } from '@/hooks/useTheme';
import { MobileLayout } from '@/components/layout/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/hooks/useToast';
import { WorkflowStatusBadge, WorkflowTimeline } from '@/components/workflow/WorkflowComponents';
import { useServiceRequests } from '@/features/service-requests/hooks/useServiceRequests';

export default function CustomerRequestsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('/service-requests');

  const { requests, loading, creating, createRequest, cancelRequest } = useServiceRequests();

  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('HVAC Electrical');
  const [description, setDescription] = useState('');
  const [serviceAddress, setServiceAddress] = useState('');

  const handleTabChange = (href: string) => {
    setActiveTab(href);
    if (href !== '/service-requests') {
      router.push(href as any);
    }
  };

  const handleCreate = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error('Validation Error', 'Please enter a title and description.');
      return;
    }

    try {
      await createRequest({
        title: title.trim(),
        category,
        description: description.trim(),
        serviceAddress: serviceAddress.trim() || 'Primary Property Address',
      });
      toast.success('Ticket Submitted', 'Your service request has been logged.');
      setModalOpen(false);
      setTitle('');
      setDescription('');
      setServiceAddress('');
    } catch (err: any) {
      toast.error('Submission Failed', err.message || 'Could not submit request.');
    }
  };

  const handleCancel = async (id: string, ticket: string) => {
    await cancelRequest(id);
    toast.success('Ticket Cancelled', `Service request ${ticket} was cancelled.`);
  };

  return (
    <ProtectedRoute>
      <RoleGuard roles={['CUSTOMER']}>
        <MobileLayout
          title="My Service Requests"
          activeTab={activeTab}
          onTabChange={handleTabChange}
          rightAction={
            <Button size="sm" variant="primary" onPress={() => setModalOpen(true)}>
              + Request
            </Button>
          }
        >
          <ScrollView contentContainerStyle={styles.container}>
            {loading ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <Spinner size="lg" />
              </View>
            ) : requests.length === 0 ? (
              <Text style={{ textAlign: 'center', color: colors.mutedForeground, marginVertical: 30 }}>
                No active service requests.
              </Text>
            ) : (
              requests.map((sr) => (
                <Card key={sr.id}>
                  <CardHeader style={styles.cardHeader}>
                    <View style={styles.headerTop}>
                      <Text style={[styles.ticketNo, { color: colors.primary }]}>{sr.ticketNumber}</Text>
                      <WorkflowStatusBadge status={sr.status} />
                    </View>
                    <CardTitle>{sr.title}</CardTitle>
                  </CardHeader>
                  <CardContent style={{ gap: 10 }}>
                    <Text style={{ fontSize: 12, color: colors.mutedForeground }}>{sr.description}</Text>

                    <View style={[styles.row, { borderColor: colors.border }]}>
                      <Text style={{ fontSize: 11, color: colors.mutedForeground }}>Category:</Text>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: colors.cardForeground }}>{sr.category}</Text>
                    </View>

                    {(sr.status === 'CREATED' || sr.status === 'ASSIGNED') && (
                      <Button variant="outline" size="sm" onPress={() => handleCancel(sr.id, sr.ticketNumber)}>
                        Cancel Request
                      </Button>
                    )}

                    <WorkflowTimeline events={sr.history || []} />
                  </CardContent>
                </Card>
              ))
            )}

            {/* Modal for Request Creation */}
            <Modal visible={modalOpen} transparent animationType="slide" onRequestClose={() => setModalOpen(false)}>
              <View style={styles.modalOverlay}>
                <View style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.modalTitle, { color: colors.cardForeground }]}>Submit Service Request</Text>
                  <Input label="Request Title" placeholder="e.g. Leaking Faucet" value={title} onChangeText={setTitle} />
                  <Input label="Service Address" placeholder="Address" value={serviceAddress} onChangeText={setServiceAddress} />
                  <Input label="Problem Description" placeholder="Details..." value={description} onChangeText={setDescription} />

                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                    <Button variant="outline" onPress={() => setModalOpen(false)} style={{ flex: 1 }}>
                      Cancel
                    </Button>
                    <Button variant="primary" loading={creating} onPress={handleCreate} style={{ flex: 1 }}>
                      Submit
                    </Button>
                  </View>
                </View>
              </View>
            </Modal>
          </ScrollView>
        </MobileLayout>
      </RoleGuard>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  cardHeader: {
    gap: 4,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketNo: {
    fontSize: 12,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
});

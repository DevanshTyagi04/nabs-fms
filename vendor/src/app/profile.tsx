import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ProtectedRoute } from '@/auth/guards/ProtectedRoute';
import { RoleGuard } from '@/auth/guards/RoleGuard';
import { useAuth } from '@/auth/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { MobileLayout } from '@/components/layout/Layout';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/hooks/useToast';
import { useProfile } from '@/features/users/hooks/useProfile';

export default function VendorProfileScreen() {
  const { role } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const toast = useToast();

  const { profile, loading, updating, updateProfile } = useProfile();
  const [editing, setEditing] = useState(false);

  const [companyName, setCompanyName] = useState('');
  const [secondaryPhone, setSecondaryPhone] = useState('');
  const [bio, setBio] = useState('');

  const startEdit = () => {
    if (profile) {
      setCompanyName(profile.companyName || '');
      setSecondaryPhone(profile.secondaryPhone || '');
      setBio(profile.bio || '');
      setEditing(true);
    }
  };

  const handleSave = async () => {
    try {
      await updateProfile({
        companyName,
        secondaryPhone,
        bio,
      });
      toast.success('Profile Saved', 'Vendor profile information updated.');
      setEditing(false);
    } catch (err: any) {
      toast.error('Update Failed', err.message || 'Could not update profile.');
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <RoleGuard roles={['VENDOR']}>
          <MobileLayout title="Vendor Profile">
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Spinner size="lg" />
            </View>
          </MobileLayout>
        </RoleGuard>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <RoleGuard roles={['VENDOR']}>
        <MobileLayout title="Vendor Profile">
          <ScrollView contentContainerStyle={styles.container}>
            <Card>
              <CardHeader style={styles.avatarHeader}>
                <Avatar name={profile?.businessName || profile?.email || 'Vendor'} size="lg" status="online" />
                <Text style={[styles.name, { color: colors.cardForeground }]}>
                  {profile?.businessName || profile?.companyName || profile?.email}
                </Text>
                <Badge variant="primary" dot>{role || 'VENDOR'}</Badge>
              </CardHeader>

              <CardContent style={{ gap: 12 }}>
                {editing ? (
                  <View style={{ gap: 12 }}>
                    <Input
                      label="Company Name"
                      value={companyName}
                      onChangeText={setCompanyName}
                    />
                    <Input
                      label="Secondary Phone"
                      value={secondaryPhone}
                      onChangeText={setSecondaryPhone}
                    />
                    <Input
                      label="Bio / Experience Notes"
                      value={bio}
                      onChangeText={setBio}
                    />
                    <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                      <Button variant="outline" onPress={() => setEditing(false)} style={{ flex: 1 }}>
                        Cancel
                      </Button>
                      <Button variant="primary" loading={updating} onPress={handleSave} style={{ flex: 1 }}>
                        Save
                      </Button>
                    </View>
                  </View>
                ) : (
                  <>
                    <View style={[styles.infoRow, { borderColor: colors.border }]}>
                      <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Account Email</Text>
                      <Text style={[styles.infoValue, { color: colors.cardForeground }]}>{profile?.email}</Text>
                    </View>
                    <View style={[styles.infoRow, { borderColor: colors.border }]}>
                      <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Primary Phone</Text>
                      <Text style={[styles.infoValue, { color: colors.cardForeground }]}>{profile?.phone}</Text>
                    </View>
                    <View style={[styles.infoRow, { borderColor: colors.border }]}>
                      <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>GST Number</Text>
                      <Text style={[styles.infoValue, { color: colors.cardForeground }]}>{profile?.gstNumber || 'N/A'}</Text>
                    </View>
                    <View style={[styles.infoRow, { borderColor: colors.border }]}>
                      <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>PAN Number</Text>
                      <Text style={[styles.infoValue, { color: colors.cardForeground }]}>{profile?.panNumber || 'N/A'}</Text>
                    </View>
                    <View style={[styles.infoRow, { borderColor: colors.border }]}>
                      <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Completed Jobs</Text>
                      <Badge variant="success">{profile?.totalCompletedJobs || 0} Jobs</Badge>
                    </View>
                    <View style={{ marginTop: 10 }}>
                      <Button variant="primary" onPress={startEdit}>
                        Edit Profile Details
                      </Button>
                    </View>
                  </>
                )}
              </CardContent>
            </Card>

            <Button variant="outline" onPress={() => router.back()}>
              Back to Home
            </Button>
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
  avatarHeader: {
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  infoLabel: {
    fontSize: 12,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
  },
});

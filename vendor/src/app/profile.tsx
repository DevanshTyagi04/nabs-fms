import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ProtectedRoute } from '@/auth/guards/ProtectedRoute';
import { RoleGuard } from '@/auth/guards/RoleGuard';
import { useAuth } from '@/auth/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { MobileLayout } from '@/components/layout/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function VendorProfileScreen() {
  const { user, role } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <ProtectedRoute>
      <RoleGuard roles={['VENDOR']}>
        <MobileLayout title="Vendor Profile">
          <View style={styles.container}>
            <Card>
              <CardHeader style={styles.avatarHeader}>
                <Avatar name={user?.firstName || user?.email || 'Vendor'} size="lg" status="online" />
                <Text style={[styles.name, { color: colors.cardForeground }]}>
                  {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.email}
                </Text>
                <Badge variant="primary" dot>{role || 'VENDOR'}</Badge>
              </CardHeader>
              <CardContent style={{ gap: 10 }}>
                <View style={[styles.infoRow, { borderColor: colors.border }]}>
                  <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>User ID</Text>
                  <Text style={[styles.infoValue, { color: colors.cardForeground }]}>{user?.id}</Text>
                </View>
                <View style={[styles.infoRow, { borderColor: colors.border }]}>
                  <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Email</Text>
                  <Text style={[styles.infoValue, { color: colors.cardForeground }]}>{user?.email}</Text>
                </View>
                <View style={[styles.infoRow, { borderColor: colors.border }]}>
                  <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Phone</Text>
                  <Text style={[styles.infoValue, { color: colors.cardForeground }]}>{user?.phone || 'Not provided'}</Text>
                </View>
              </CardContent>
            </Card>

            <Button variant="outline" onPress={() => router.back()}>
              Back to Home
            </Button>
          </View>
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

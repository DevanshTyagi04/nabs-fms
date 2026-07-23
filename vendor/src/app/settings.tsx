import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ProtectedRoute } from '@/auth/guards/ProtectedRoute';
import { RoleGuard } from '@/auth/guards/RoleGuard';
import { useTheme } from '@/hooks/useTheme';
import { MobileLayout } from '@/components/layout/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

export default function VendorSettingsScreen() {
  const { colors, resolvedMode, toggleTheme } = useTheme();
  const router = useRouter();

  return (
    <ProtectedRoute>
      <RoleGuard roles={['VENDOR']}>
        <MobileLayout title="Settings">
          <View style={styles.container}>
            <Card>
              <CardHeader>
                <CardTitle>Application Settings</CardTitle>
              </CardHeader>
              <CardContent style={{ gap: 12 }}>
                <View style={[styles.settingRow, { borderColor: colors.border }]}>
                  <View style={styles.rowLeft}>
                    <Icon name={resolvedMode === 'dark' ? 'sun' : 'moon'} size="sm" color="primary" />
                    <Text style={[styles.settingLabel, { color: colors.cardForeground }]}>Appearance Theme</Text>
                  </View>
                  <Button size="sm" variant="outline" onPress={toggleTheme}>
                    {resolvedMode.toUpperCase()}
                  </Button>
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
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  settingLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
});

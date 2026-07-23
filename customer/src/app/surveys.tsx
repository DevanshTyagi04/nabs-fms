import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ProtectedRoute } from '@/auth/guards/ProtectedRoute';
import { RoleGuard } from '@/auth/guards/RoleGuard';
import { useTheme } from '@/hooks/useTheme';
import { MobileLayout } from '@/components/layout/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { FormEngine } from '@/forms/FormEngine';
import { useSurveys } from '@/features/surveys/hooks/useSurveys';

export default function CustomerSurveysScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('/surveys');

  const { surveys, loading } = useSurveys();

  const handleTabChange = (href: string) => {
    setActiveTab(href);
    if (href !== '/surveys') {
      router.push(href as any);
    }
  };

  return (
    <ProtectedRoute>
      <RoleGuard roles={['CUSTOMER']}>
        <MobileLayout title="Technical Surveys" activeTab={activeTab} onTabChange={handleTabChange}>
          <ScrollView contentContainerStyle={styles.container}>
            {loading ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <Spinner size="lg" />
              </View>
            ) : surveys.length === 0 ? (
              <Text style={{ textAlign: 'center', color: colors.mutedForeground, marginVertical: 30 }}>
                No completed technical surveys.
              </Text>
            ) : (
              surveys.map((srv) => (
                <Card key={srv.id}>
                  <CardHeader style={styles.cardHeader}>
                    <View style={styles.headerTop}>
                      <Text style={[styles.ticketNo, { color: colors.primary }]}>{srv.ticketNumber}</Text>
                      <Badge variant="success" dot>Approved</Badge>
                    </View>
                    <CardTitle>{srv.title}</CardTitle>
                  </CardHeader>
                  <CardContent style={{ gap: 10 }}>
                    <FormEngine rating={srv.rating} notes={srv.notes} />
                  </CardContent>
                </Card>
              ))
            )}
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
});

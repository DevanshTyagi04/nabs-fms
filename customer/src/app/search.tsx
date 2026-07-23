import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { ProtectedRoute } from '@/auth/guards/ProtectedRoute';
import { RoleGuard } from '@/auth/guards/RoleGuard';
import { useTheme } from '@/hooks/useTheme';
import { MobileLayout } from '@/components/layout/Layout';
import { Spinner } from '@/components/ui/Spinner';
import { SearchResultCard } from '@/search/SearchResultCard';
import { useSearch } from '@/features/search/hooks/useSearch';

export default function CustomerSearchScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('/search');
  const [query, setQuery] = useState('');

  const { results, loading } = useSearch(query);

  const handleTabChange = (href: string) => {
    setActiveTab(href);
    if (href !== '/search') {
      router.push(href as any);
    }
  };

  return (
    <ProtectedRoute>
      <RoleGuard roles={['CUSTOMER']}>
        <MobileLayout title="My Search & Discovery" activeTab={activeTab} onTabChange={handleTabChange}>
          <ScrollView contentContainerStyle={styles.container}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search invoices, requests, estimates..."
              placeholderTextColor={colors.mutedForeground}
              style={[
                styles.searchInput,
                { backgroundColor: colors.surface, borderColor: colors.border, color: colors.cardForeground },
              ]}
            />

            {loading ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <Spinner size="lg" />
              </View>
            ) : results.length === 0 ? (
              <Text style={{ textAlign: 'center', color: colors.mutedForeground, marginVertical: 30 }}>
                No search results found.
              </Text>
            ) : (
              results.map((r) => (
                <SearchResultCard
                  key={r.id}
                  title={r.title}
                  subtitle={r.subtitle}
                  entityType={r.entityType}
                  referenceNumber={r.referenceNumber}
                  onPress={() => router.push(r.targetRoute as any)}
                />
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
    gap: 12,
  },
  searchInput: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 13,
  },
});

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Icon } from '@/components/ui/Icon';
import { UserMenu } from './UserMenu';
import { NavigationRegistry, NavItem } from '@/navigation/registry';
import { useAuth } from '@/auth/hooks/useAuth';

export function SafeAreaWrapper({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>{children}</SafeAreaView>;
}

export function StackHeader({
  title,
  showBack,
  onBack,
  rightAction,
}: {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}) {
  const { colors } = useTheme();

  return (
    <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      <View style={styles.headerLeft}>
        {showBack && onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Icon name="chevron-left" size="lg" color="cardForeground" />
          </TouchableOpacity>
        ) : null}
        <Text style={[styles.headerTitle, { color: colors.cardForeground }]}>{title}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        {rightAction ? rightAction : <UserMenu />}
      </View>
    </View>
  );
}

export function BottomTabShell({
  activeTab,
  onTabChange,
  items,
}: {
  activeTab: string;
  onTabChange: (key: string) => void;
  items?: NavItem[];
}) {
  const { colors } = useTheme();
  const { role } = useAuth();
  const navItems = items || NavigationRegistry.getItems(role);

  return (
    <View style={[styles.tabBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      {navItems.map((tab) => {
        const isActive = activeTab === tab.href || (tab.href === '/' && activeTab === 'home');
        const isDisabled = tab.disabled;

        return (
          <TouchableOpacity
            key={tab.id}
            disabled={isDisabled}
            onPress={() => onTabChange(tab.href)}
            style={[styles.tabItem, isDisabled && { opacity: 0.4 }]}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <Icon name={tab.icon} size="md" color={isActive ? 'primary' : 'muted'} />
            <Text
              style={[
                styles.tabLabel,
                { color: isActive ? colors.primary : colors.mutedForeground, fontWeight: isActive ? '700' : '400' },
              ]}
            >
              {tab.title}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export interface MobileLayoutProps {
  title?: string;
  header?: React.ReactNode;
  bottomBar?: React.ReactNode;
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (key: string) => void;
  rightAction?: React.ReactNode;
}

export function MobileLayout({
  title = 'Vendor Portal',
  header,
  bottomBar,
  children,
  activeTab,
  onTabChange,
  rightAction,
}: MobileLayoutProps) {
  const { colors } = useTheme();

  return (
    <SafeAreaWrapper>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {header || <StackHeader title={title} rightAction={rightAction} />}
        <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
        {bottomBar !== null && (bottomBar || (activeTab && onTabChange ? <BottomTabShell activeTab={activeTab} onTabChange={onTabChange} /> : null))}
      </View>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  tabBar: {
    height: 60,
    flexDirection: 'row',
    borderTopWidth: 1,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  tabLabel: {
    fontSize: 11,
  },
});

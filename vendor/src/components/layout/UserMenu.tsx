import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/auth/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';

export function UserMenu() {
  const [open, setOpen] = useState(false);
  const { user, role, logout } = useAuth();
  const { resolvedMode, toggleTheme, colors } = useTheme();
  const router = useRouter();

  return (
    <View>
      <TouchableOpacity onPress={() => setOpen(true)} style={styles.avatarBtn}>
        <Avatar name={user?.firstName || user?.email || 'User'} size="sm" status="online" />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View style={styles.backdrop}>
            <TouchableWithoutFeedback>
              <View style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.userInfo, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.userName, { color: colors.cardForeground }]}>
                    {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.email}
                  </Text>
                  <Text style={[styles.userEmail, { color: colors.mutedForeground }]}>{user?.email}</Text>
                  <Badge variant="primary" size="sm" style={{ marginTop: 4 }}>
                    {role || 'VENDOR'}
                  </Badge>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    setOpen(false);
                    router.push('/profile' as any);
                  }}
                  style={styles.menuItem}
                >
                  <Icon name="user" size="sm" color="cardForeground" />
                  <Text style={[styles.itemText, { color: colors.cardForeground }]}>My Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setOpen(false);
                    router.push('/settings' as any);
                  }}
                  style={styles.menuItem}
                >
                  <Icon name="settings" size="sm" color="cardForeground" />
                  <Text style={[styles.itemText, { color: colors.cardForeground }]}>Settings</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={toggleTheme} style={styles.menuItem}>
                  <Icon name={resolvedMode === 'dark' ? 'sun' : 'moon'} size="sm" color="cardForeground" />
                  <Text style={[styles.itemText, { color: colors.cardForeground }]}>
                    Theme: {resolvedMode.toUpperCase()}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setOpen(false);
                    logout();
                  }}
                  style={[styles.menuItem, { borderTopWidth: 1, borderTopColor: colors.border }]}
                >
                  <Icon name="x" size="sm" color="error" />
                  <Text style={[styles.itemText, { color: colors.error }]}>Sign Out</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  avatarBtn: {
    padding: 2,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 16,
  },
  menuCard: {
    width: 220,
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  userInfo: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  userName: {
    fontSize: 13,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 11,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  itemText: {
    fontSize: 13,
    fontWeight: '500',
  },
});

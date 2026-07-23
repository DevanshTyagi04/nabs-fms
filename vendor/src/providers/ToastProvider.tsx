import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Icon } from '@/components/ui/Icon';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const { colors } = useTheme();

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<ToastItem, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast = { ...toast, id };
      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  const success = useCallback((title: string, message?: string) => addToast({ type: 'success', title, message }), [addToast]);
  const error = useCallback((title: string, message?: string) => addToast({ type: 'error', title, message }), [addToast]);
  const warning = useCallback((title: string, message?: string) => addToast({ type: 'warning', title, message }), [addToast]);
  const info = useCallback((title: string, message?: string) => addToast({ type: 'info', title, message }), [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
      {children}
      <View style={styles.toastContainer} pointerEvents="box-none">
        {toasts.map((item) => (
          <View
            key={item.id}
            style={[
              styles.toastBox,
              {
                backgroundColor: colors.card,
                borderColor:
                  item.type === 'success'
                    ? colors.success
                    : item.type === 'error'
                    ? colors.error
                    : item.type === 'warning'
                    ? colors.warning
                    : colors.info,
              },
            ]}
          >
            <View style={styles.iconCol}>
              <Icon
                name={
                  item.type === 'success'
                    ? 'check-circle'
                    : item.type === 'error'
                    ? 'alert-circle'
                    : item.type === 'warning'
                    ? 'alert-triangle'
                    : 'info'
                }
                color={item.type}
                size="md"
              />
            </View>
            <View style={styles.textCol}>
              <Text style={[styles.title, { color: colors.cardForeground }]}>{item.title}</Text>
              {item.message ? (
                <Text style={[styles.message, { color: colors.mutedForeground }]}>{item.message}</Text>
              ) : null}
            </View>
            <TouchableOpacity onPress={() => removeToast(item.id)} style={styles.closeBtn}>
              <Icon name="x" size="sm" color="muted" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    zIndex: 999,
    gap: 8,
  },
  toastBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  iconCol: {
    marginRight: 10,
  },
  textCol: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  message: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
});

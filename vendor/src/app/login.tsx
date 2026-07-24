import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/auth/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Dialog } from '@/components/ui/Dialog';
import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { SafeAreaWrapper } from '@/components/layout/Layout';

export default function VendorLoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoModalOpen, setInfoModalOpen] = useState(false);

  const { login } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();
  const toast = useToast();

  const handleLogin = async () => {
    setErrorMessage(null);
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login({ email: email.trim(), password });
      toast.success('Login Successful', 'Welcome to NABS Vendor App.');
      router.replace('/');
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaWrapper>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <Card style={styles.card}>
            <CardHeader style={styles.header}>
              <View style={[styles.logoBadge, { backgroundColor: colors.primary }]}>
                <Text style={[styles.logoText, { color: colors.primaryForeground }]}>V</Text>
              </View>
              <CardTitle style={{ textAlign: 'center' }}>NABS Vendor App</CardTitle>
              <CardDescription style={{ textAlign: 'center' }}>Sign in to view job dispatches & schedules</CardDescription>
            </CardHeader>

            <CardContent style={{ gap: 14 }}>
              {errorMessage ? (
                <View style={[styles.errorBanner, { backgroundColor: colors.error + '15', borderColor: colors.error + '40' }]}>
                  <Icon name="alert-circle" color="error" size="sm" />
                  <Text style={[styles.errorText, { color: colors.error }]}>{errorMessage}</Text>
                </View>
              ) : null}

              <Input
                label="Vendor Email"
                placeholder="vendor@nabs.com"
                leftIcon="mail"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                editable={!loading}
              />

              <PasswordInput
                label="Password"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                editable={!loading}
              />
            </CardContent>

            <CardFooter style={{ flexDirection: 'column', gap: 14, paddingTop: 10 }}>
              <Button variant="primary" loading={loading} onPress={handleLogin} style={{ width: '100%' }}>
                Sign In
              </Button>

              <View style={styles.footerNav}>
                <Text style={[styles.footerText, { color: colors.mutedForeground }]}>Need a Vendor Account? </Text>
                <TouchableOpacity onPress={() => setInfoModalOpen(true)} disabled={loading}>
                  <Text style={[styles.linkText, { color: colors.primary }]}>Request Access</Text>
                </TouchableOpacity>
              </View>
            </CardFooter>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>

      <Dialog
        open={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
        title="Vendor Partner Onboarding"
        description="How to get onboarded as a verified service partner"
        footer={
          <Button variant="primary" size="sm" onPress={() => setInfoModalOpen(false)}>
            Got It
          </Button>
        }
      >
        <View style={{ gap: 12 }}>
          <Text style={{ fontSize: 13, color: colors.cardForeground, lineHeight: 18 }}>
            NABS Vendor accounts are provisioned and verified by Platform Administrators to ensure service quality, GST compliance, and background verification.
          </Text>
          <View style={[styles.infoBox, { backgroundColor: colors.muted + '20', borderColor: colors.border }]}>
            <Icon name="info" size="sm" color="info" />
            <Text style={{ fontSize: 12, color: colors.mutedForeground, flex: 1 }}>
              To register your business as a service provider, please contact dispatch operations at admin@nabs.com or submit your verification documents to your regional manager.
            </Text>
          </View>
        </View>
      </Dialog>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    gap: 6,
  },
  logoBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    gap: 8,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  footerNav: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    gap: 8,
  },
});

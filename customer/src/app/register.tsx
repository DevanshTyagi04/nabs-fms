import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/auth/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { SafeAreaWrapper } from '@/components/layout/Layout';

export default function CustomerRegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { register } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();
  const toast = useToast();

  const handleRegister = async () => {
    setErrorMessage(null);

    // Form Validations
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim() || !password || !confirmPassword) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        companyName: companyName.trim() || undefined,
      });

      toast.success('Registration Successful', 'Welcome to NABS Customer Platform!');
      router.replace('/');
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please check your details and try again.');
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
                <Text style={[styles.logoText, { color: colors.primaryForeground }]}>C</Text>
              </View>
              <CardTitle style={{ textAlign: 'center' }}>Create Account</CardTitle>
              <CardDescription style={{ textAlign: 'center' }}>Join NABS to book and manage field service requests</CardDescription>
            </CardHeader>

            <CardContent style={{ gap: 12 }}>
              {errorMessage ? (
                <View style={[styles.errorBanner, { backgroundColor: colors.error + '15', borderColor: colors.error + '40' }]}>
                  <Icon name="alert-circle" color="error" size="sm" />
                  <Text style={[styles.errorText, { color: colors.error }]}>{errorMessage}</Text>
                </View>
              ) : null}

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Input
                    label="First Name *"
                    placeholder="John"
                    leftIcon="user"
                    value={firstName}
                    onChangeText={setFirstName}
                    editable={!loading}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Input
                    label="Last Name *"
                    placeholder="Doe"
                    leftIcon="user"
                    value={lastName}
                    onChangeText={setLastName}
                    editable={!loading}
                  />
                </View>
              </View>

              <Input
                label="Email Address *"
                placeholder="john.doe@example.com"
                leftIcon="mail"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                editable={!loading}
              />

              <Input
                label="Phone Number *"
                placeholder="+18005550199"
                leftIcon="user"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                editable={!loading}
              />

              <Input
                label="Company Name (Optional)"
                placeholder="Acme Services Inc."
                leftIcon="briefcase"
                value={companyName}
                onChangeText={setCompanyName}
                editable={!loading}
              />

              <PasswordInput
                label="Password *"
                placeholder="Minimum 8 characters"
                value={password}
                onChangeText={setPassword}
                editable={!loading}
              />

              <PasswordInput
                label="Confirm Password *"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                editable={!loading}
              />
            </CardContent>

            <CardFooter style={{ flexDirection: 'column', gap: 14, paddingTop: 10 }}>
              <Button variant="primary" loading={loading} onPress={handleRegister} style={{ width: '100%' }}>
                Register Account
              </Button>

              <View style={styles.footerNav}>
                <Text style={[styles.footerText, { color: colors.mutedForeground }]}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/login' as any)} disabled={loading}>
                  <Text style={[styles.linkText, { color: colors.primary }]}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </CardFooter>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
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
    maxWidth: 440,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
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
});

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSignUp, useSignIn } from '@clerk/clerk-expo';
import { colors } from '@/constants/colors';

const LoginScreen = () => {
  const { signUp, setActive, isLoaded: signUpLoaded } = useSignUp();
  const { signIn, setActive: setActiveSignIn, isLoaded: signInLoaded } = useSignIn();

  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sign up state
  const [emailSignUp, setEmailSignUp] = useState('');
  const [passwordSignUp, setPasswordSignUp] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);

  // Sign in state
  const [emailSignIn, setEmailSignIn] = useState('');
  const [passwordSignIn, setPasswordSignIn] = useState('');

  const handleSignUp = async () => {
    if (!signUpLoaded || !emailSignUp || !passwordSignUp) return;

    if (passwordSignUp !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await signUp.create({
        emailAddress: emailSignUp,
        password: passwordSignUp,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!signUpLoaded || !verificationCode) return;

    setLoading(true);
    setError(null);

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
      } else {
        setError('Verification failed');
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!signInLoaded || !emailSignIn || !passwordSignIn) return;

    setLoading(true);
    setError(null);

    try {
      const result = await signIn.create({
        identifier: emailSignIn,
        password: passwordSignIn,
      });

      await setActiveSignIn({ session: result.createdSessionId });
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          <View
            style={{
              flex: 1,
              paddingHorizontal: 20,
              paddingVertical: 40,
              justifyContent: 'space-between',
            }}
          >
            {/* Header */}
            <View style={{ alignItems: 'center', marginTop: 20 }}>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: colors.primaryLight,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 20,
                }}
              >
                <Text style={{ fontSize: 40 }}>💪</Text>
              </View>
              <Text style={{ fontSize: 28, fontWeight: '700', color: colors.foreground, marginBottom: 8 }}>
                Fitness App
              </Text>
              <Text style={{ fontSize: 14, color: colors.muted, textAlign: 'center' }}>
                {isSignUp ? 'Create your account' : 'Sign in to your account'}
              </Text>
            </View>

            {/* Form */}
            <View style={{ width: '100%' }}>
              {error && (
                <View
                  style={{
                    backgroundColor: '#fee2e2',
                    borderLeftWidth: 4,
                    borderLeftColor: colors.destructive,
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 16,
                  }}
                >
                  <Text style={{ color: colors.destructive, fontSize: 14 }}>{error}</Text>
                </View>
              )}

              {pendingVerification ? (
                // Verification form
                <View>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground, marginBottom: 12 }}>
                    Verify Email
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: colors.muted,
                      marginBottom: 16,
                    }}
                  >
                    Enter the verification code sent to {emailSignUp}
                  </Text>

                  <TextInput
                    placeholder="Verification code"
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    placeholderTextColor={colors.muted}
                    editable={!loading}
                    style={{
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      fontSize: 16,
                      color: colors.foreground,
                      marginBottom: 20,
                      backgroundColor: colors.card,
                    }}
                  />

                  <Pressable
                    onPress={handleVerify}
                    disabled={loading || !verificationCode}
                    style={{
                      backgroundColor: loading || !verificationCode ? colors.border : colors.primary,
                      paddingVertical: 14,
                      borderRadius: 12,
                      alignItems: 'center',
                      flexDirection: 'row',
                      justifyContent: 'center',
                    }}
                  >
                    {loading ? (
                      <ActivityIndicator color={colors.background} />
                    ) : (
                      <Text
                        style={{
                          color: colors.background,
                          fontWeight: '600',
                          fontSize: 16,
                        }}
                      >
                        Verify
                      </Text>
                    )}
                  </Pressable>
                </View>
              ) : isSignUp ? (
                // Sign up form
                <View>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground, marginBottom: 12 }}>
                    Email
                  </Text>
                  <TextInput
                    placeholder="you@example.com"
                    value={emailSignUp}
                    onChangeText={setEmailSignUp}
                    placeholderTextColor={colors.muted}
                    editable={!loading}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={{
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      fontSize: 16,
                      color: colors.foreground,
                      marginBottom: 16,
                      backgroundColor: colors.card,
                    }}
                  />

                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground, marginBottom: 12 }}>
                    Password
                  </Text>
                  <TextInput
                    placeholder="Enter password"
                    value={passwordSignUp}
                    onChangeText={setPasswordSignUp}
                    placeholderTextColor={colors.muted}
                    editable={!loading}
                    secureTextEntry
                    style={{
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      fontSize: 16,
                      color: colors.foreground,
                      marginBottom: 16,
                      backgroundColor: colors.card,
                    }}
                  />

                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground, marginBottom: 12 }}>
                    Confirm Password
                  </Text>
                  <TextInput
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholderTextColor={colors.muted}
                    editable={!loading}
                    secureTextEntry
                    style={{
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      fontSize: 16,
                      color: colors.foreground,
                      marginBottom: 24,
                      backgroundColor: colors.card,
                    }}
                  />

                  <Pressable
                    onPress={handleSignUp}
                    disabled={loading || !emailSignUp || !passwordSignUp || !confirmPassword}
                    style={{
                      backgroundColor:
                        loading || !emailSignUp || !passwordSignUp || !confirmPassword
                          ? colors.border
                          : colors.primary,
                      paddingVertical: 14,
                      borderRadius: 12,
                      alignItems: 'center',
                      flexDirection: 'row',
                      justifyContent: 'center',
                      marginBottom: 16,
                    }}
                  >
                    {loading ? (
                      <ActivityIndicator color={colors.background} />
                    ) : (
                      <Text
                        style={{
                          color: colors.background,
                          fontWeight: '600',
                          fontSize: 16,
                        }}
                      >
                        Sign Up
                      </Text>
                    )}
                  </Pressable>

                  <Pressable onPress={() => setIsSignUp(false)} disabled={loading}>
                    <Text style={{ textAlign: 'center', color: colors.muted, fontSize: 14 }}>
                      Already have an account?{' '}
                      <Text style={{ color: colors.primary, fontWeight: '600' }}>Sign In</Text>
                    </Text>
                  </Pressable>
                </View>
              ) : (
                // Sign in form
                <View>
                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground, marginBottom: 12 }}>
                    Email
                  </Text>
                  <TextInput
                    placeholder="you@example.com"
                    value={emailSignIn}
                    onChangeText={setEmailSignIn}
                    placeholderTextColor={colors.muted}
                    editable={!loading}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={{
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      fontSize: 16,
                      color: colors.foreground,
                      marginBottom: 16,
                      backgroundColor: colors.card,
                    }}
                  />

                  <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground, marginBottom: 12 }}>
                    Password
                  </Text>
                  <TextInput
                    placeholder="Enter password"
                    value={passwordSignIn}
                    onChangeText={setPasswordSignIn}
                    placeholderTextColor={colors.muted}
                    editable={!loading}
                    secureTextEntry
                    style={{
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      fontSize: 16,
                      color: colors.foreground,
                      marginBottom: 24,
                      backgroundColor: colors.card,
                    }}
                  />

                  <Pressable
                    onPress={handleSignIn}
                    disabled={loading || !emailSignIn || !passwordSignIn}
                    style={{
                      backgroundColor:
                        loading || !emailSignIn || !passwordSignIn ? colors.border : colors.primary,
                      paddingVertical: 14,
                      borderRadius: 12,
                      alignItems: 'center',
                      flexDirection: 'row',
                      justifyContent: 'center',
                      marginBottom: 16,
                    }}
                  >
                    {loading ? (
                      <ActivityIndicator color={colors.background} />
                    ) : (
                      <Text
                        style={{
                          color: colors.background,
                          fontWeight: '600',
                          fontSize: 16,
                        }}
                      >
                        Sign In
                      </Text>
                    )}
                  </Pressable>

                  <Pressable onPress={() => setIsSignUp(true)} disabled={loading}>
                    <Text style={{ textAlign: 'center', color: colors.muted, fontSize: 14 }}>
                      Don't have an account?{' '}
                      <Text style={{ color: colors.primary, fontWeight: '600' }}>Sign Up</Text>
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>

            {/* Footer */}
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 12, color: colors.muted }}>By continuing, you agree to our</Text>
              <Text style={{ fontSize: 12, color: colors.muted }}>
                <Text style={{ color: colors.primary }}>Terms of Service</Text> and{' '}
                <Text style={{ color: colors.primary }}>Privacy Policy</Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

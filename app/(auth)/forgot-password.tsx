import { FirebaseError } from "firebase/app";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/providers/auth-provider";

function formatError(err: unknown) {
  if (err instanceof FirebaseError) {
    switch (err.code) {
      case "auth/invalid-email":
        return "Enter a valid email address.";
      case "auth/user-not-found":
        return "No account found with this email.";
      default:
        return "Could not send reset link. Please try again.";
    }
  }

  return "Could not send reset link. Please try again.";
}

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentMessage, setSentMessage] = useState<string | null>(null);

  const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

  const handleSubmit = async () => {
    const cleanedEmail = email.trim();
    if (!cleanedEmail) {
      setError("Email is required.");
      setSentMessage(null);
      return;
    }
    if (!isValidEmail(cleanedEmail)) {
      setError("Enter a valid email address.");
      setSentMessage(null);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await resetPassword(cleanedEmail);
      // Firebase may not tell us if the email exists; use neutral copy.
      setSentMessage("If an account exists for this email, a reset link is on the way.");
    } catch (err) {
      setError(formatError(err));
      setSentMessage(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0f172a" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={24}
      >
        <View style={{ flex: 1, padding: 24, gap: 16, justifyContent: "center" }}>
          <View>
            <Text style={{ fontSize: 30, fontWeight: "800", color: "#e2e8f0" }}>
              Reset password
            </Text>
            <Text style={{ marginTop: 6, color: "#cbd5e1" }}>
              Enter your account email to receive a reset link.
            </Text>
          </View>

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            style={{
              borderWidth: 1,
              borderColor: "#334155",
              borderRadius: 10,
              paddingHorizontal: 14,
              paddingVertical: 12,
              backgroundColor: "#0b1221",
              color: "#e2e8f0",
            }}
            placeholderTextColor="#64748b"
          />

          {sentMessage ? <Text style={{ color: "#22c55e" }}>{sentMessage}</Text> : null}
          {error ? <Text style={{ color: "#f87171" }}>{error}</Text> : null}

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            style={{
              backgroundColor: submitting ? "#1e293b" : "#22c55e",
              paddingVertical: 14,
              borderRadius: 10,
              alignItems: "center",
              shadowColor: "#22c55e",
              shadowOpacity: 0.3,
              shadowRadius: 6,
            }}
          >
            {submitting ? (
              <ActivityIndicator color="#0f172a" />
            ) : (
              <Text style={{ color: "#0f172a", fontWeight: "800" }}>Send reset link</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: "#38bdf8", fontWeight: "700" }}>Back to sign in</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

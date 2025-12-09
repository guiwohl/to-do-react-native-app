import { FirebaseError } from "firebase/app";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={24}
      >
        <View style={{ flex: 1, padding: 24, gap: 16, justifyContent: "center" }}>
          <View>
            <Text style={{ fontSize: 28, fontWeight: "700", color: "#111" }}>
              Reset password
            </Text>
            <Text style={{ marginTop: 4, color: "#555" }}>
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
              borderColor: "#d1d5db",
              borderRadius: 10,
              paddingHorizontal: 14,
            paddingVertical: 12,
          }}
        />

          {sentMessage ? <Text style={{ color: "#065f46" }}>{sentMessage}</Text> : null}
          {error ? <Text style={{ color: "#b91c1c" }}>{error}</Text> : null}

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting}
            style={{
              backgroundColor: submitting ? "#9ca3af" : "#111827",
              paddingVertical: 14,
              borderRadius: 10,
              alignItems: "center",
            }}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "#fff", fontWeight: "700" }}>Send reset link</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: "#111827", fontWeight: "600" }}>Back to sign in</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

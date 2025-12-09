import { useRouter } from "expo-router";
import { FirebaseError } from "firebase/app";
import { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../src/providers/auth-provider";

function formatError(err: unknown) {
  if (err instanceof FirebaseError) {
    switch (err.code) {
      case "auth/invalid-email":
        return "Enter a valid email address.";
      case "auth/email-already-in-use":
        return "Email already in use.";
      case "auth/weak-password":
        return "Password should be at least 6 characters.";
      default:
        return "Could not create account. Please try again.";
    }
  }

  return "Could not create account. Please try again.";
}

export default function SignUpScreen() {
  const router = useRouter();
  const { signUpWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);
  const isValidPassword = (value: string) => value.length >= 6;

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!isValidPassword(password)) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await signUpWithEmail(trimmedEmail, password);
      router.replace("/");
    } catch (err) {
      setError(formatError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const isDisabled = submitting || !isValidEmail(email.trim()) || !isValidPassword(password);

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
              Create account
            </Text>
            <Text style={{ marginTop: 6, color: "#cbd5e1" }}>
              Sign up to start organizing your tasks.
            </Text>
          </View>

          <View style={{ gap: 12 }}>
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
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              secureTextEntry
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
          </View>

          {error ? <Text style={{ color: "#f87171" }}>{error}</Text> : null}

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isDisabled}
            style={{
              backgroundColor: isDisabled ? "#1e293b" : "#22c55e",
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
              <Text style={{ color: "#0f172a", fontWeight: "800" }}>Sign up</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: "#38bdf8", fontWeight: "700" }}>
              Already have an account? Sign in
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

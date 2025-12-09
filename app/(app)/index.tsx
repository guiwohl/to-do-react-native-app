import { useState } from "react";
import { ActivityIndicator, SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../src/providers/auth-provider";

export default function HomeScreen() {
  const { uid, signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ flex: 1, padding: 24, justifyContent: "center", gap: 16 }}>
        <Text style={{ fontSize: 28, fontWeight: "700", color: "#111" }}>
          You are signed in
        </Text>
        <Text style={{ color: "#4b5563" }}>UID: {uid}</Text>
        <Text style={{ color: "#4b5563" }}>
          Task list will live here once we hook up Firestore.
        </Text>

        <TouchableOpacity
          onPress={handleSignOut}
          disabled={loading}
          style={{
            backgroundColor: loading ? "#9ca3af" : "#b91c1c",
            paddingVertical: 14,
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontWeight: "700" }}>Sign out</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

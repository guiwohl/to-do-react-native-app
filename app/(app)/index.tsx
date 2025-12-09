import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { addTask, listenTasks, removeTask, toggleTask } from "../../src/lib/tasks";
import { useAuth } from "../../src/providers/auth-provider";

type Task = {
  id: string;
  title: string;
  done: boolean;
};

export default function HomeScreen() {
  const { uid, signOut } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    if (!uid) return;
    setLoadingTasks(true);
    const unsubscribe = listenTasks(uid, (next) => {
      setTasks(next as Task[]);
      setLoadingTasks(false);
    });
    return unsubscribe;
  }, [uid]);

  const palette =
    theme === "dark"
      ? {
          bg: "#0f172a",
          card: "#111827",
          border: "#1f2937",
          text: "#e2e8f0",
          muted: "#cbd5e1",
          primary: "#22c55e",
          danger: "#f87171",
          accent: "#38bdf8",
          checkBorder: "#22c55e",
          checkBg: "#064e3b",
        }
      : {
          bg: "#f8fafc",
          card: "#ffffff",
          border: "#e2e8f0",
          text: "#0f172a",
          muted: "#475569",
          primary: "#0ea5e9",
          danger: "#dc2626",
          accent: "#0ea5e9",
          checkBorder: "#10b981",
          checkBg: "#d1fae5",
        };

  const sortedTasks = useMemo(
    () => tasks.slice().sort((a, b) => a.title.localeCompare(b.title)),
    [tasks],
  );

  const handleAddTask = async () => {
    if (!uid) return;
    const title = newTitle.trim();
    if (!title) {
      setError("Task title is required.");
      return;
    }
    setError(null);
    setSubmitting(true);

    const tempId = `temp-${Date.now()}`;
    const optimisticTask: Task = { id: tempId, title, done: false };
    setTasks((prev) => [optimisticTask, ...prev]);
    setNewTitle("");

    try {
      const docRef = await addTask(uid, title);
      setTasks((prev) =>
        prev.map((task) => (task.id === tempId ? { ...task, id: docRef.id } : task)),
      );
    } catch (err) {
      setTasks((prev) => prev.filter((task) => task.id !== tempId));
      setError("Could not add task. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (taskId: string, done: boolean) => {
    if (!uid) return;
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, done } : task)));
    try {
      await toggleTask(uid, taskId, done);
    } catch (err) {
      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? { ...task, done: !done } : task)),
      );
      setError("Could not update task. Please try again.");
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!uid) return;
    const removed = tasks.find((t) => t.id === taskId);
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
    try {
      await removeTask(uid, taskId);
    } catch (err) {
      if (removed) {
        setTasks((prev) => [removed, ...prev]);
      }
      setError("Could not delete task. Please try again.");
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.bg }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={24}
      >
        <View style={{ flex: 1, padding: 24, gap: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View>
              <Text style={{ fontSize: 28, fontWeight: "800", color: palette.text }}>Tasks</Text>
              <Text style={{ color: palette.muted }}>Signed in as {uid}</Text>
            </View>
            <TouchableOpacity
              onPress={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: palette.border,
                backgroundColor: palette.card,
              }}
            >
              <Text style={{ color: palette.text, fontWeight: "700" }}>
                {theme === "dark" ? "Light" : "Dark"}
              </Text>
            </TouchableOpacity>
          </View>

          <View
            style={{
              flexDirection: "row",
              gap: 12,
              alignItems: "center",
              borderWidth: 1,
              borderColor: palette.border,
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 8,
              backgroundColor: palette.card,
            }}
          >
            <TextInput
              placeholder="Add a task..."
              value={newTitle}
              onChangeText={setNewTitle}
              style={{ flex: 1, paddingVertical: 6, color: palette.text }}
              returnKeyType="done"
              onSubmitEditing={handleAddTask}
              placeholderTextColor={theme === "dark" ? "#64748b" : "#94a3b8"}
            />
            <TouchableOpacity
              onPress={handleAddTask}
              disabled={submitting}
              style={{
                backgroundColor: submitting ? palette.border : palette.primary,
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 10,
              }}
            >
              {submitting ? (
                <ActivityIndicator color={theme === "dark" ? "#0f172a" : "#fff"} />
              ) : (
                <Text style={{ color: theme === "dark" ? "#0f172a" : "#fff", fontWeight: "800" }}>
                  Add
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {error ? <Text style={{ color: palette.danger }}>{error}</Text> : null}

          {loadingTasks ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <ActivityIndicator />
              <Text style={{ marginTop: 8, color: palette.muted }}>Loading tasks...</Text>
            </View>
          ) : sortedTasks.length === 0 ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Text style={{ fontSize: 18, fontWeight: "700", color: palette.text }}>
                No tasks yet
              </Text>
              <Text style={{ color: palette.muted }}>Add your first task to get started.</Text>
            </View>
          ) : (
            <FlatList
              data={sortedTasks}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ gap: 12, paddingBottom: 80 }}
              renderItem={({ item }) => (
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: palette.border,
                    borderRadius: 12,
                    padding: 12,
                    backgroundColor: palette.card,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => handleToggle(item.id, !item.done)}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      borderWidth: 2,
                      borderColor: item.done ? palette.checkBorder : palette.muted,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: item.done ? palette.checkBg : palette.card,
                    }}
                  >
                    {item.done ? <Text style={{ color: palette.text }}>✓</Text> : null}
                  </TouchableOpacity>
                  <Text
                    style={{
                      flex: 1,
                      color: palette.text,
                      textDecorationLine: item.done ? "line-through" : "none",
                    }}
                  >
                    {item.title}
                  </Text>
                  <TouchableOpacity onPress={() => handleDelete(item.id)}>
                    <Text style={{ color: palette.danger, fontWeight: "800" }}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          )}

          <TouchableOpacity
            onPress={handleSignOut}
            disabled={signingOut}
            style={{
              backgroundColor: signingOut ? palette.border : palette.danger,
              paddingVertical: 14,
              borderRadius: 10,
              alignItems: "center",
              marginTop: "auto",
            }}
          >
            {signingOut ? (
              <ActivityIndicator color={theme === "dark" ? "#0f172a" : "#fff"} />
            ) : (
              <Text style={{ color: theme === "dark" ? "#0f172a" : "#fff", fontWeight: "800" }}>
                Sign out
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

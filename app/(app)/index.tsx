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
import { addTask, listenTasks, removeTask, toggleTask } from "../../src/lib/tasks";
import { useAuth } from "../../src/providers/auth-provider";
import { SafeAreaView } from "react-native-safe-area-context";
  
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

  useEffect(() => {
    if (!uid) return;
    setLoadingTasks(true);
    const unsubscribe = listenTasks(uid, (next) => {
      setTasks(next as Task[]);
      setLoadingTasks(false);
    });
    return unsubscribe;
  }, [uid]);

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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={24}
      >
        <View style={{ flex: 1, padding: 24, gap: 16 }}>
          <View>
            <Text style={{ fontSize: 28, fontWeight: "700", color: "#111" }}>Tasks</Text>
            <Text style={{ color: "#4b5563" }}>Signed in as {uid}</Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              gap: 12,
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#d1d5db",
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 8,
            }}
          >
            <TextInput
              placeholder="Add a task..."
              value={newTitle}
              onChangeText={setNewTitle}
              style={{ flex: 1, paddingVertical: 6 }}
              returnKeyType="done"
              onSubmitEditing={handleAddTask}
            />
            <TouchableOpacity
              onPress={handleAddTask}
              disabled={submitting}
              style={{
                backgroundColor: submitting ? "#9ca3af" : "#111827",
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 10,
              }}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: "#fff", fontWeight: "700" }}>Add</Text>
              )}
            </TouchableOpacity>
          </View>

          {error ? <Text style={{ color: "#b91c1c" }}>{error}</Text> : null}

          {loadingTasks ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <ActivityIndicator />
              <Text style={{ marginTop: 8, color: "#4b5563" }}>Loading tasks...</Text>
            </View>
          ) : sortedTasks.length === 0 ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Text style={{ fontSize: 18, fontWeight: "600", color: "#111" }}>
                No tasks yet
              </Text>
              <Text style={{ color: "#4b5563" }}>Add your first task to get started.</Text>
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
                    borderColor: "#e5e7eb",
                    borderRadius: 12,
                    padding: 12,
                    backgroundColor: "#f9fafb",
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
                      borderColor: item.done ? "#10b981" : "#9ca3af",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: item.done ? "#d1fae5" : "#fff",
                    }}
                  >
                    {item.done ? <Text style={{ color: "#047857" }}>✓</Text> : null}
                  </TouchableOpacity>
                  <Text
                    style={{
                      flex: 1,
                      color: "#111",
                      textDecorationLine: item.done ? "line-through" : "none",
                    }}
                  >
                    {item.title}
                  </Text>
                  <TouchableOpacity onPress={() => handleDelete(item.id)}>
                    <Text style={{ color: "#b91c1c", fontWeight: "700" }}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          )}

          <TouchableOpacity
            onPress={handleSignOut}
            disabled={signingOut}
            style={{
              backgroundColor: signingOut ? "#9ca3af" : "#b91c1c",
              paddingVertical: 14,
              borderRadius: 10,
              alignItems: "center",
              marginTop: "auto",
            }}
          >
            {signingOut ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "#fff", fontWeight: "700" }}>Sign out</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

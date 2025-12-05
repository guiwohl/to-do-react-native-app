import { useState } from "react";
import { Text, TextInput, View } from "react-native";

export default function Index() {
  const [text, setText] = useState("");

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Welcome to my app!!</Text>
      <TextInput
        placeholder="Type something..."
        value={text}
        onChangeText={setText}
        style={{
          marginTop: 16,
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 8,
          width: 240,
        }}
      />
    </View>
  );
}

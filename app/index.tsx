import { useState } from "react"; // React hook for managing component state so we can store input text
import {
  Keyboard, // API to control/dismiss the keyboard
  KeyboardAvoidingView, // Adjusts UI when keyboard is shown
  Platform, // Detects OS to set platform-specific behavior
  Text, // Displays text content
  TextInput, // Input field for user text
  TouchableWithoutFeedback, // Wrapper to catch taps for dismissing keyboard
  View, // Basic container/view
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"; // Safe area helpers to avoid notches/status bars

export default function Index() {
  const [text, setText] = useState(""); // Store current value of the text input
  const insets = useSafeAreaInsets(); // Read safe area padding to offset keyboard correctly

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* Root container respecting safe areas with white background */}
      <KeyboardAvoidingView
        style={{ flex: 1 }} // Fill available space so children can center vertically
        behavior={Platform.OS === "ios" ? "padding" : "height"} // Use padding on iOS (better animation), height on Android
        keyboardVerticalOffset={insets.top} // Offset for status bar/notch so keyboard avoidance is accurate
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          {/* Dismiss keyboard when user taps outside input */}
          <View
            style={{
              flex: 1, // Fill parent so content can be centered
              paddingHorizontal: 24, // Horizontal padding for breathing room
              justifyContent: "center", // Center vertically
              alignItems: "center", // Center horizontally
            }}
          >
            <Text>Welcome to my app!!!</Text> {/* Header text to greet the user */}
            <TextInput
              placeholder="Type something..." // Hint text when the input is empty
              value={text} // Controlled value bound to component state
              onChangeText={setText} // Update state whenever user types
              style={{
                marginTop: 16, // Space between label and input
                paddingHorizontal: 12, // Left/right padding inside input
                paddingVertical: 10, // Top/bottom padding inside input
                borderWidth: 1, // Outline thickness
                borderColor: "#ccc", // Light gray border color
                borderRadius: 8, // Rounded corners for a softer look
                width: "100%", // Full width within padded container
              }}
            />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

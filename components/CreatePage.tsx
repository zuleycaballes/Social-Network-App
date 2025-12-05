import { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from "../auth/Auth";
import { createPost } from "../services/Posts";

export default function CreatePage({ navigation }: { navigation: any }) {
  const { token } = useContext(AuthContext);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreatePost = async () => {
    if (!content.trim()) {
      Alert.alert("Error", "Please write something.");
      return;
    }

    if (content.length > 280) {
      Alert.alert("Error", "Post is too long. Max 280 characters.");
      return;
    }

    setLoading(true);

    try {
      if (!token) return;
      await createPost(token, content);

      Alert.alert("Success!", "Your post has been created.");
      setContent("");
      navigation.navigate("Profile", { refresh: Date.now() });
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not create post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Create a New Post</Text>
          
          <View style={styles.card}>
            <TextInput
              style={styles.input}
              placeholder="Write here xdd"
              placeholderTextColor="#888"
              multiline
              numberOfLines={6}
              maxLength={280}
              value={content}
              onChangeText={setContent}
              textAlignVertical="top"
            />
            
            <Text style={styles.counter}>
              {content.length}/280
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.6 }]}
            onPress={handleCreatePost}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>POST</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              setContent("");
              navigation.goBack();
            }}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#DEEBF5",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    flexGrow: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: "top",
    padding: 0,
  },
  counter: {
    textAlign: "right",
    color: "#888",
    fontSize: 14,
    marginTop: 8,
  },
  button: {
    backgroundColor: "#2196F3",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  cancelButton: {
    padding: 16,
    alignItems: "center",
  },
  cancelText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
});
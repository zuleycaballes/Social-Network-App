import { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from "react-native";
import { login as loginAPI } from "../services/AuthService";
import { AuthContext } from "../auth/Auth";

export default function Login({navigation}: {navigation:any}) {
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setMessage("");

    if (!email || !password) {
      setMessage("Por favor llena todos los campos.");
      return;
    }

    setLoading(true);

    try {
      const res = await loginAPI(email, password);

      login(res.token, res.userId);

      setMessage(`Login exitoso, bienvenid@ ${res.username}!`);
      navigation.navigate("MainTabs")

      Alert.alert("Login successful!", `Welcome ${res.username}`);

    } catch (error) {
      setMessage("Credenciales inválidas.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log In</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        placeholderTextColor="#888"
        onChangeText={setPassword}
      />

      {message !== "" && (
        <Text style={styles.message}>{message}</Text>
      )}

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>LOG IN</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: {
    fontSize: 26,
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 20
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginBottom: 12,
    borderRadius: 8
  },
  message: {
    textAlign: "center",
    color: "#d6336c",
    marginBottom: 10,
    fontWeight: "600"
  },
  button: {
    backgroundColor: "#2196F3",
    padding: 14,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center"
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16
  }
});

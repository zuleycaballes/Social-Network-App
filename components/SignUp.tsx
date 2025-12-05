import { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, StyleSheet} from "react-native";
import { signup } from "../services/AuthService";
import { AuthContext } from "../auth/Auth";

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidPassword = (password: string) =>
  /^[A-Za-z0-9._\-!]{8,16}$/.test(password);

const SignUp = ({ navigation } : {navigation: any}) => {
  const { login } = useContext(AuthContext);

  const [username, setUsername] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage]   = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSignUp = async () => {
    setMessage("");

    if (!username || !email || !password) {
      setMessage("Por favor llena todos los campos.");
      return;
    }

    if (!isValidEmail(email)) {
      setMessage("El correo no es válido.");
      return;
    }

    if (!isValidPassword(password)) {
      setMessage("La contraseña debe ser 8–16 caracteres y solo usar letras, números o . _ - !");
      return;
    }

    setLoading(true);

    try {
      const res = await signup(username, email, password);

      if (!res?.token) {
        setMessage("Ese correo o username ya está en uso.");
        return;
      }

      login(res.token, res.user);

      setMessage("¡Cuenta creada correctamente!");

      Alert.alert("Account created!", `Bienvenid@ ${username}`);

      navigation.navigate("Login")

    } catch (error) {
      setMessage("Ese correo o username ya está en uso.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Create Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#888"
        onChangeText={setUsername}
      />

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
        onPress={handleSignUp}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>SIGN UP</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },

  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    padding: 5
  },
  backText: {
    fontSize: 18,
    color: "#2196F3",
    fontWeight: "600"
  },

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
    borderRadius: 8,
    fontSize: 16
  },
  message: {
    color: "#d6336c",
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "600"
  },
  button: {
    backgroundColor: "#2196F3",
    padding: 13,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center"
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16
  }
});

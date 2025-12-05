import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function Welcome({navigation}: {navigation:any}) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome!</Text>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigation.navigate("Login")}
      >
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, { backgroundColor: "#4CAF50" }]} 
        onPress={() => navigation.navigate("SignUp")}
      >
        <Text style={styles.buttonText}>Create Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    justifyContent: "center",
    padding: 20
    },
  title: { 
    fontSize: 32,
    textAlign: "center",
    fontWeight: "800",
    marginBottom: 40
  },
  button: {
    backgroundColor: "#2196F3",
    padding: 14,
    borderRadius: 10,
    marginBottom: 15
  },
  buttonText: {
    textAlign: "center",
    color: "white",
    fontSize: 18,
    fontWeight: "700"
  }
});

import { useEffect, useState, useContext } from "react";
import { View, Text, ActivityIndicator, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthContext } from "../auth/Auth";
import { getFollowers } from "../services/FollowListsAPI";

export default function FollowersList({ route, navigation }: { route: any; navigation: any }) {
  const { userId } = route.params;
  const { token } = useContext(AuthContext);

  const [followers, setFollowers] = useState<Array<{ id: number; username: string }>>([]);
  const [loading, setLoading] = useState(true);

  const loadFollowers = async () => {
    try {
      if (!token) return;
      const data = await getFollowers(userId, token);
      setFollowers(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFollowers();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backWrapper}>
          <Text style={styles.backButton}>Back</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Followers</Text>

      <FlatList
        data={followers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }: { item: { id: number; username: string } }) => (
          <TouchableOpacity onPress={() => navigation.navigate("UserPage", { user_id: item.id })}>
            <View style={styles.card}>
              <Text style={styles.username}>@{item.username}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#DEEBF5",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 10,
  },
  backWrapper: {
    borderRadius: 8,
    overflow: "hidden",
  },
  backButton: {
    backgroundColor: "#0391F7",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 15,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  username: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0391F7",
  },
});

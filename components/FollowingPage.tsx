import { useContext, useEffect, useState } from "react";
import { View, Text, ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../auth/Auth';
import { getFollowingPosts } from '../services/Posts';
import { likePost, unlikePost } from "../services/Posts";

export default function FollowingPage({ navigation }: { navigation: any }) {
  const [posts, setPosts] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const { token, userId } = useContext(AuthContext);

  const goToUser = (user_id: number) => {
    navigation.navigate('UserPage', { user_id });
  };

  const loadFollowingPosts = async () => {
    try {
      setError("");
      if (!token) return;
      if (!userId) return;
      const data = await getFollowingPosts(token, userId);
      setPosts(data);
    } catch (err) {
      console.log(err);
      setError("No se pudieron cargar los posts :(");
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (postId: number) => {
    if (!token || !userId) return;

    try {
      const post = posts.find((p: any) => p.id === postId);
      if (!post) return;

      const hasLiked = post.likes.includes(userId);

      let updatedPost: any;

      if (hasLiked) {
        await unlikePost(token, postId);
        updatedPost = { ...post, likes: post.likes.filter((id: number) => id !== userId) };
      } else {
        await likePost(token, postId);
        updatedPost = { ...post, likes: [...post.likes, userId] };
      }

      setPosts(posts.map((p: any) => (p.id === postId ? updatedPost : p)));

    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Could not toggle like.");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFollowingPosts();
    setRefreshing(false);
  };

  useEffect(() => {
    if (token) loadFollowingPosts();
  }, [token]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  if (error !== "") {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Posts from people you follow :)</Text>

      {posts.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ color: '#666', fontSize: 16, textAlign: 'center' }}>
            No posts yet from people you follow.{"\n"}Start following people!
          </Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item: any) => item.id.toString()}
          onRefresh={onRefresh}
          refreshing={refreshing}
          renderItem={({ item }: { item: any }) => (
            <View style={styles.post}>
              <TouchableOpacity onPress={() => goToUser(item.user_id)}>
                <Text style={styles.username}>@{item.username}</Text>
              </TouchableOpacity>

              <Text style={styles.content}>{item.content}</Text>
              <Text style={styles.date}>
                {new Date(item.created_at).toLocaleString()}
              </Text>

              <View style={styles.likeRow}>
                <TouchableOpacity 
                  style={styles.likeButton} 
                  onPress={() => toggleLike(item.id)}
                >
                  <Text style={styles.likeText}>
                    {item.likes.includes(userId!) ? "Unlike" : "Like"}
                  </Text>
                </TouchableOpacity>

                <Text style={styles.likes}>{item.likes.length} likes</Text>
              </View>
            </View>
          )}
        />
      )}
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
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 15,
  },
  post: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  username: {
    fontWeight: "600",
    marginBottom: 6,
    fontSize: 16,
    color: "#0391F7",
  },
  content: {
    fontSize: 16,
    marginBottom: 6,
  },
  date: {
    color: "#777",
    fontSize: 12,
  },
  likes: {
    marginTop: 6,
    fontWeight: "500",
    color: "#444",
  },
  error: {
    color: "red",
    fontSize: 18,
    fontWeight: "bold",
  },
  likeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6
  },
  likeButton: {
    marginRight: 10
  },
  likeText: {
    color: "#0391F7",
    fontWeight: "600"
  },
});


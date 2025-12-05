import { useContext, useEffect, useState } from "react";
import { View, Text, ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../auth/Auth';
import { getPosts } from "../services/PostsAPI";
import { likePost, unlikePost } from "../services/Posts";

export interface Post { 
  id: number; 
  content: string; 
  created_at: string; 
  updated_at: string; 
  user_id: number; 
  username: string; 
  likes: number[]; 
}

export default function PostsScreen({ navigation }: { navigation: any }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);  

  const { token, userId } = useContext(AuthContext);

  const goToUser = (user_id: number) => {
    navigation.navigate('UserPage', { user_id });
  };

  const loadPosts = async () => {
    try {
      setError("");
      if (!token) return;
      const data = await getPosts(token, 1, 30);
      setPosts(data);
    } catch (err) {
      console.log(err);
      setError("Posts couldn't be loaded :(");
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (postId: number) => {
    if (!token || !userId) return;
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const hasLiked = post.likes.includes(userId!);

      let updatedPost: Post;

      if (hasLiked) {
        await unlikePost(token, postId);

        const newLikes = post.likes.filter(id => id !== userId);
        updatedPost = { ...post, likes: newLikes };

      } else {
        await likePost(token, postId);

        const newLikes = [...post.likes, userId!];
        updatedPost = { ...post, likes: newLikes };
      }

      setPosts(posts.map(p => (p.id === postId ? updatedPost : p)));

    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Could not toggle like.");
    }
  };

  useEffect(() => {
    if (token) loadPosts();
  }, [token]);

  const onRefresh = async () => {        
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error !== "") { 
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        {console.log(error)}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Most recent posts :)</Text>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id.toString()}
        refreshing={refreshing}         
        onRefresh={onRefresh}           
        renderItem={({ item }: { item: Post }) => (
          <View style={styles.post}>
            <TouchableOpacity onPress={() => goToUser(item.user_id)}>
              <Text style={styles.username}>@{item.username}</Text>
            </TouchableOpacity>
            <Text style={styles.content}>{item.content}</Text>
            <Text style={styles.date}>
              {new Date(item.updated_at).toLocaleString()}
            </Text>
            <View style={styles.likeRow}>
              <TouchableOpacity
                onPress={() => toggleLike(item.id)}
                style={styles.likeButton}
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



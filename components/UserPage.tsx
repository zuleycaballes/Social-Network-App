import { useContext, useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../auth/Auth';
import { getUserById, getUserPosts } from '../services/UserPageAPI';
import { follow, unfollow } from '../services/Follow';

export interface UserInfo {
  id: number;
  username: string;
  follower_count: string;
  following_count: string;
  is_following: boolean;
}

export interface UserPost {
  id: number;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: number;
  username: string;
  likes: number[];
}

export default function UserPage({ route, navigation }: { route: any, navigation: any }) {
  const { token, logout } = useContext(AuthContext);

  const [user, setUser] = useState<UserInfo | null>(null);
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user_id } = route.params;

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleFollowToggle = async () => {
    if (!user) return;

    try {
      let message = '';
      if (!token) return;
      if (user.is_following) {
        message = await unfollow(user.id, token);
      } else {
        message = await follow(user.id, token);
      }

      setUser({ ...user, is_following: !user.is_following });

      await onRefresh();

      Alert.alert('Success', message);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Could not change follow status.');
    }
  };

  const loadData = async () => {
    try {
      setError('');
      if (!token) return;
      const userData = await getUserById(user_id, token);
      const userPosts = await getUserPosts(user_id, token);

      setUser(userData);
      setPosts(userPosts);
    } catch (err) {
      console.error(err);
      setError('Could not load user information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [user_id]);


  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.buttonGoBack}>Back to Posts</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>
      {error !== '' && (
        <Text style={styles.error}>{error}</Text>
      )}
      {user && (
        <>
          <Text style={styles.username}>{user.username}</Text>
          <Text style={styles.stats}>
            Followers: {user.follower_count} | Following: {user.following_count}
          </Text>
          <View style={styles.boton}>
            <TouchableOpacity onPress={handleFollowToggle}>
              <Text style={styles.botonFollow}>
                {user.is_following ? 'Unfollow' : 'Follow'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Posts</Text>
        </>
      )}
      {user && posts.length === 0 && error === '' && (
        <Text style={styles.noPosts}>This user has no posts.</Text>
      )}
      {user && posts.length > 0 && (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }: { item: UserPost }) => (
            <View style={styles.post}>
              <Text style={styles.usernamePost}>@{item.username}</Text>
              <Text style={styles.content}>{item.content}</Text>
            <Text style={styles.date}>
              {new Date(item.created_at).toLocaleString()}
            </Text>
            <Text style={styles.likes}>{item.likes.length} likes</Text>
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
    backgroundColor: '#DEEBF5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  username: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  post: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  usernamePost: {
    fontWeight: "600",
    marginBottom: 6,
    fontSize: 16,
  },
  content: {
    fontSize: 16,
    marginBottom: 6,
  },
  noPosts:{
    color: "666"
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
  buttonsContainer:{
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",  
    marginBottom: 15,
  },
  stats: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  boton: {
    alignItems: 'center',
  },
  botonFollow: {
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#0391F7',
    paddingInline: 12,
    paddingBlock: 6,
    marginBlock: 6,
    borderRadius: 8,
    marginBottom: 12,
    textAlign: 'center',
    alignItems: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#0391F7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  error: {
    color: 'red',
    fontSize: 18,
    fontWeight: 'bold',
    padding: 20,
    textAlign: 'center',
  },
  buttonGoBack: {
    backgroundColor: "#0391F7",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    color: "white",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
  },
  logout: {
    backgroundColor: "#f44336",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    color: "white",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
  }
});


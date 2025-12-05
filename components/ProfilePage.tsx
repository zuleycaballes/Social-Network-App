import { useContext, useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../auth/Auth';
import { getUserById, getUserPosts } from '../services/UserPageAPI';
import { updatePost, deletePost } from '../services/Posts';
import { likePost, unlikePost } from "../services/Posts";

export interface ProfileInfo {
  id: number;
  username: string;
  follower_count: string;
  following_count: string;
  is_following: boolean;
}

export interface ProfilePost {
  id: number;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: number;
  username: string;
  likes: number[];
}

export default function ProfilePage({ navigation }: { navigation: any }) {
  const { token, logout, userId } = useContext(AuthContext);

  const [profile, setProfile] = useState<ProfileInfo | null>(null);
  const [posts, setPosts] = useState<ProfilePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const loadData = async () => {
    try {
      setError('');
      if (!token) return;
      if (!userId) return;
      const profileData = await getUserById(userId, token);
      const postsData = await getUserPosts(userId, token);
      setProfile(profileData);
      setPosts(postsData);
      
    } catch (err) {
      console.error(err);
      setError('Could not load user information.');
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async (postId: number) => { 
    if (!token || !userId) return;
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const hasLiked = post.likes.includes(userId);
      let updatedPost: ProfilePost;

      if (hasLiked) {
        await unlikePost(token, postId);
        updatedPost = { ...post, likes: post.likes.filter(id => id !== userId) };
      } else {
        await likePost(token, postId);
        updatedPost = { ...post, likes: [...post.likes, userId] };
      }

      setPosts(posts.map(p => (p.id === postId ? updatedPost : p)));
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Could not toggle like.");
    }
  };

  const goToFollowers = () => {
    navigation.navigate("FollowersList", { userId });
  };

  const goToFollowing = () => {
    navigation.navigate("FollowingList", { userId });
  };


  const handleEditPost = (post: ProfilePost) => {
    setEditingPostId(post.id);
    setEditContent(post.content);
    setModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      Alert.alert("Error", "Post cannot be empty.");
      return;
    }

    if (editContent.length > 280) {
      Alert.alert("Error", "Post is too long. Max 280 characters.");
      return;
    }

    setEditLoading(true);

    try {
      if (!token) return;
      if (!editingPostId) return;
      await updatePost(token, editingPostId, editContent);

      setPosts(posts.map(post => 
        post.id === editingPostId 
          ? { ...post, content: editContent.trim(), updated_at: new Date().toISOString() }
          : post
      ));

      setModalVisible(false);
      setEditingPostId(null);
      setEditContent('');
      
      Alert.alert("Success", "Post updated successfully");
    } catch (err) {
      console.error("Error completo:", err);
      Alert.alert("Error", `Could not update post`);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeletePost = async (postId: number) => {
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              if (!token) return;
              await deletePost(token, postId);

              setPosts(posts.filter(post => post.id !== postId));
              
              Alert.alert("Success", "Post deleted successfully");
            } catch (err) {
              console.error(err);
              Alert.alert("Error", "Could not delete post. Please try again.");
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [userId]);

  useEffect(() => {
    const unsubscribe = navigation?.addListener('focus', () => {
      loadData();
    });

    return unsubscribe;
  }, [navigation]);

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
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>
      
      {error !== '' && (
        <Text style={styles.error}>{error}</Text>
      )}
      
      {profile && (
        <>
          <Text style={styles.username}>{profile.username}</Text>
          <View style={styles.statsRow}>
            <TouchableOpacity onPress={goToFollowers}>
              <Text style={styles.statsLink}>Followers: {profile.follower_count}</Text>
            </TouchableOpacity>

            <Text style={styles.statsSeparator}> | </Text>

            <TouchableOpacity onPress={goToFollowing}>
              <Text style={styles.statsLink}>Following: {profile.following_count}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
      
      {profile && <Text style={styles.sectionTitle}>My Posts</Text>}
      
      {profile && posts.length === 0 && error === '' && (
        <Text style={{ color: '#666', textAlign: 'center', marginTop: 20 }}>
          You haven't posted anything yet.
        </Text>
      )}
      
      {profile && posts.length > 0 && (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id.toString()}
          onRefresh={onRefresh}
          refreshing={refreshing}
          renderItem={({ item }: { item: ProfilePost }) => (
            <View style={styles.post}>
              <View style={styles.postHeader}>
                <Text style={styles.usernamePost}>@{item.username}</Text>
                <View style={styles.buttonGroup}>
                  <TouchableOpacity 
                    onPress={() => handleEditPost(item)}
                    style={styles.editButton}
                  >
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => handleDeletePost(item.id)}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <Text style={styles.content}>{item.content}</Text>
              <Text style={styles.date}>
                {new Date(item.updated_at).toLocaleString()}
              </Text>
              {item.created_at !== item.updated_at && (
                <Text style={styles.edited}>(edited)</Text>
              )}

              <View style={styles.likeRow}>
                <TouchableOpacity onPress={() => toggleLike(item.id)} style={styles.likeButton}>
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

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setEditingPostId(null);
          setEditContent('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Post</Text>
            
            <TextInput
              style={styles.modalInput}
              value={editContent}
              onChangeText={setEditContent}
              multiline
              maxLength={280}
              placeholder="Edit your post..."
              placeholderTextColor="#888"
            />
            
            <Text style={styles.charCounter}>
              {editContent.length}/280
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setEditingPostId(null);
                  setEditContent('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, editLoading && { opacity: 0.6 }]}
                onPress={handleSaveEdit}
                disabled={editLoading}
              >
                {editLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  usernamePost: {
    fontWeight: "600",
    fontSize: 16,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  editButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#f44336',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    fontSize: 16,
    marginBottom: 6,
  },
  date: {
    color: "#777",
    fontSize: 12,
  },
  edited: {
    color: "#999",
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 2,
  },
  likes: {
    marginTop: 6,
    fontWeight: "500",
    color: "#444",
  },
  buttonsContainer:{
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",  
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
  },
  error: {
    color: 'red',
    fontSize: 18,
    fontWeight: 'bold',
    padding: 20,
    textAlign: 'center',
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  charCounter: {
    textAlign: 'right',
    color: '#888',
    fontSize: 14,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#2196F3',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
  statsRow: {
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: 5,
},

statsLink: {
  fontSize: 16,
  fontWeight: "700",
  color: "#0391F7",
},

statsSeparator: {
  fontSize: 16,
  color: "#333",
  marginHorizontal: 6,
},
});
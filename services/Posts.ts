import axios from 'axios';

const API_URL = 'https://tec-social-network.onrender.com/api';

export async function getAllPosts(token: string, page = 1, limit = 20) {
  if (!token) throw new Error("No token provided");

  const response = await axios.get(`${API_URL}/posts`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    params: { page, limit },
  });

  return response.data;
}

export async function getFollowingPosts(token: string, userId: number) {
  if (!token) throw new Error("No token provided");

  const followingRes = await axios.get(`${API_URL}/users/${userId}/following`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const followingUsers = followingRes.data;

  if (followingUsers.length === 0) return [];

  const postsRes = await axios.get(`${API_URL}/posts`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    params: { page: 1, limit: 100 },
  });

  const followingIds = followingUsers.map((u: any) => u.id);

  return postsRes.data.filter((post: any) =>
    followingIds.includes(post.user_id)
  );
}

export async function createPost(token: string, content: string) {
  if (!token) throw new Error("No token provided");
  if (!content.trim()) throw new Error("Content cannot be empty");

  const response = await axios.post(
    `${API_URL}/posts`,
    { content: content.trim() },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
}

export async function updatePost(token: string, postId: number, content: string) {
  if (!token) throw new Error("No token provided");
  if (!content.trim()) throw new Error("Content cannot be empty");

  try {
    const response = await axios.patch(
      `${API_URL}/posts/${postId}`,
      { content: content.trim() },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;

  } catch {
    const response = await axios.put(
      `${API_URL}/posts/${postId}`,
      { content: content.trim() },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  }
}

export async function deletePost(token: string, postId: number) {
  if (!token) throw new Error("No token provided");

  await axios.delete(`${API_URL}/posts/${postId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  return true;
}

export async function likePost(token: string, postId: number) {
  const response = await axios.put(
    `${API_URL}/posts/${postId}/like`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
}

export async function unlikePost(token: string, postId: number) {
  const response = await axios.delete(
    `${API_URL}/posts/${postId}/like`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
}

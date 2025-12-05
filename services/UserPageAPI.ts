import axios from 'axios';

const API_URL = 'https://tec-social-network.onrender.com/api';

export async function getUserById(userId: number, token: string) {
  if (!token) throw new Error("No token provided");

  const response = await axios.get(`${API_URL}/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  return response.data;
}

export async function getUserPosts(userId: number, token: string, page = 1, limit = 10) {
  if (!token) throw new Error("No token provided");

  const response = await axios.get(`${API_URL}/users/${userId}/posts`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    params: { page, limit },
  });

  return response.data;
}



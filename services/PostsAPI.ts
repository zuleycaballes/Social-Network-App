import axios from 'axios';

const API_URL = 'https://tec-social-network.onrender.com/api';

export async function getPosts(token: string, page = 1, limit = 10) {
  if (!token) throw new Error("No token provided");

  const response = await axios.get(`${API_URL}/posts`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    params: { page, limit },
  });

  return response.data;
}


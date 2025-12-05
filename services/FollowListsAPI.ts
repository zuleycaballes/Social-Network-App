import axios from "axios";

const API_URL = "https://tec-social-network.onrender.com/api";

export async function getFollowers(userId: number, token: string) {
  const response = await axios.get(`${API_URL}/users/${userId}/followers`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
}

export async function getFollowing(userId: number, token: string) {
  const response = await axios.get(`${API_URL}/users/${userId}/following`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
}

import axios from 'axios';

const API_URL = 'https://tec-social-network.onrender.com/api';

export async function follow(user_id: number, token: string) {
  const response = await axios.put(`${API_URL}/users/${user_id}/follow`, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.message;
}

export async function unfollow(user_id: number, token: string) {
  const response = await axios.delete(`${API_URL}/users/${user_id}/follow`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.message;
}


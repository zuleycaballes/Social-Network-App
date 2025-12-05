import axios from 'axios';

const API_URL = 'https://tec-social-network.onrender.com/api/auth';

export async function signup(username: string, email: string, password: string) {
  const response = await axios.post(`${API_URL}/signup`, {username, email, password});
  return response.data;
}

export async function login(email: string, password: string) {
  const response = await axios.post(`${API_URL}/login`, {email, password});
  return response.data; 
}

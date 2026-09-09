import axios from '../src/api/axios';

const API_URL = '/chatbot';

export const sendMessage = async (message, token) => {
  const { data } = await axios.post(`${API_URL}/message`, { message }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data.reply;
};

export const getHistory = async (token) => {
  const { data } = await axios.get(`${API_URL}/history`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};
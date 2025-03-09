import axios from 'axios';
import { showAlert } from './alert.js';
export const login = async (email, password) => {
  try {
    const res = await axios.post(
      '/api/v1/users/login',
      {
        email,
        password,
      },
      { withCredentials: true },
    );
    if (res.data.status === 'success') {
      showAlert('success', 'Logged In successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response?.data?.message);
  }
};

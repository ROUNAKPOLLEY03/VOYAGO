import axios from 'axios';
import { showAlert } from './alert';

export const forgotPassword = async (email) => {
  try {
    const res = await axios.post(
      '/api/v1/users/forgotPassword',
      {
        email,
      },
      { withCredentials: true },
    );
    if (res.data.status === 'success') {
      showAlert(
        'success',
        'A reset link has been sent to your registered email. Please check your inbox.',
      );
      window.setTimeout(() => {
        location.assign('/login');
      }, 5000);
    }
  } catch (err) {
    showAlert('error', err.response?.data?.message);
  }
};

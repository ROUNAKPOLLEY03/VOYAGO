import axios from 'axios';
import { showAlert } from './alert';

export const resetPassword = async ({ password, passwordConfirm }) => {
  try {
    const token = window.location.pathname.split('/').pop();
    const res = await axios.patch(
      `/api/v1/users/resetPassword/${token}`,
      {
        password,
        passwordConfirm,
      },
      { withCredentials: true },
    );
    showAlert('success', 'Password reset successfully!');

    if (res.data.status === 'success') {
      window.setTimeout(() => {
        location.assign('/');
      }, 2000);
    }
  } catch (err) {
    showAlert('error', err.response?.data?.message);
  }
};

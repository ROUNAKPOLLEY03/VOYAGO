import axios from 'axios';
import { showAlert } from './alert';

export const signup = async ({ name, email, password, passwordConfirm }) => {
  try {
    const res = await axios.post(
      '/api/v1/users/signup',
      {
        name,
        email,
        password,
        passwordConfirm,
      },
      { withCredentials: true },
    );
    if (res.data.status === 'success') {
      showAlert('success', 'Signed Up Successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 3000);
    }
  } catch (err) {
    showAlert('error', err.response?.data?.message);
  }
};

import axios from 'axios';
import { showAlert } from './alert';

export const updateAccount = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? '/api/v1/users/updateMyPassword'
        : '/api/v1/users/updateMe';
    const res = await axios.patch(url, data);
    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully`);
    }
    location.reload(true);
    location.href = '/me';
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

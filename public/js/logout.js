import axios from 'axios';
import { showAlert } from './alert';

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });
    if ((res.data.status = 'success')) {
      location.reload(true);
      location.href = '/';
    }
  } catch (err) {
    showAlert('error', 'Error logging out! Try again.');
  }
};

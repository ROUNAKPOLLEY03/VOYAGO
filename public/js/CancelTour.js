import axios from 'axios';
import { showAlert } from './alert';
export const cancelTour = async (bookingID) => {
  try {
    const res = await axios.delete(`/api/v1/bookings/my-tours/${bookingID}`);
    if (res.data.status === 'success') {
      showAlert('success', 'Tour deleted successfully!');
      location.reload(true);
    }
  } catch (err) {
    showAlert('error', err.response?.data?.message);
  }
};

import axios from 'axios';
import { showAlert } from './alert.js';
export const rejectTour = async (bookingID) => {
  try {
    const res = await axios.patch(
      `/api/v1/bookings/rejectBooking/${bookingID}`,
      {
        withCredentials: true,
      },
    );

    if (res.data.status === 'success') {
      showAlert('success', 'Tour is cancelled!');
      window.setTimeout(() => {
        location.reload(true);
      }, 2000);
    }
  } catch (err) {
    showAlert('error', err.response?.data?.message);
  }
};

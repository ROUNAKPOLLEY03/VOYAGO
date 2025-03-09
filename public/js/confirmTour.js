import axios from 'axios';
import { showAlert } from './alert.js';
export const confirmTour = async (bookingID) => {
  try {
    const res = await axios.patch(
      `/api/v1/bookings/accpetBooking/${bookingID}`,
      {
        withCredentials: true,
      },
    )

    if (res.data.status === 'success') {
      showAlert('success', 'Tour is confirmed');
      window.setTimeout(() => {
        location.reload(true);
      }, 2000);
    }
  } catch (err) {
    showAlert('error', err.response?.data?.message);
  }
};

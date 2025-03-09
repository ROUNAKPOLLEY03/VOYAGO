import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import { showAlert } from './alert.js';

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const stripe = await loadStripe(
      'pk_test_51QwzxoK7gNDmYjOLElll5oqejFhhzxm27PkucgMKyZSRvcI2DHXOzFXhubjXDVinHab0pHyhgXg12cHBAciShE9o009PTc22z0',
    );
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    // showAlert('error', err.response?.data?.message);
    showAlert('error', err.response?.data?.message);
  }
};

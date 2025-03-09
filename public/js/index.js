import '@babel/polyfill';
import { login } from './login';
import { logout } from './logout';
import { showAlert } from './alert';
import { updateAccount } from './updateSettings';
import { signup } from './signup';
import { forgotPassword } from './forgotPassword';
import { resetPassword } from './resetPassword';
import { bookTour } from './stripe';
import { cancelTour } from './CancelTour';
import { confirmTour } from './confirmTour';
import { rejectTour } from './rejectTour';

document.addEventListener('DOMContentLoaded', () => {
  window.addEventListener('hashchange', () => {
    document.body.style.zoom = '100%';
  });
});

document.addEventListener('DOMContentLoaded', function () {
  function updateOnlineStatus() {
    if (!navigator.onLine) {
      showAlert('error', 'No Internet Connection! Please check your network.');
    }
  }

  window.addEventListener('offline', updateOnlineStatus);
  window.addEventListener('online', () =>
    showAlert('success', 'You are back online!'),
  );
});

const loginForm = document.querySelector('.form');
const logoutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const signUpForm = document.querySelector('.signupform');
const btnForgotPassword = document.querySelector('.forgotpass');
const btnFP = document.querySelector('.btnFP');
const btnRP = document.querySelector('.btnRP');
const btnBook = document.getElementById('book-tour');
const btnCancelTour = document.querySelector('.btn-red');
const btnAccpet = document.querySelector('.accept');
const btnDecline = document.querySelector('.decline');
const leftArrow = document.querySelector('.left-arrow');
const rightArrow = document.querySelector('.right-arrow');

let currentPage = new URLSearchParams(window.location.search).get('page') || 1;
currentPage = parseInt(currentPage, 10);
const totalDocs = 22;
const limit = 9;
const totalPages = Math.ceil(totalDocs / limit);

// 🔹 Function to Update Pagination UI
const updatePaginationButtons = () => {
  if (currentPage <= 1) {
    leftArrow.disabled = true;
    leftArrow.classList.add('disabled');
  } else {
    leftArrow.disabled = false;
    leftArrow.classList.remove('disabled');
  }

  if (currentPage >= totalPages) {
    rightArrow.disabled = true;
    rightArrow.classList.add('disabled');
  } else {
    rightArrow.disabled = false;
    rightArrow.classList.remove('disabled');
  }
};

// 🔹 Event Listeners for Pagination
if (leftArrow) {
  leftArrow.addEventListener('click', (e) => {
    if (currentPage > 1) {
      window.location.href = `/?page=${currentPage - 1}&limit=${limit}`;
    }
  });
}

if (rightArrow) {
  rightArrow.addEventListener('click', (e) => {
    if (currentPage < totalPages) {
      window.location.href = `/?page=${currentPage + 1}&limit=${limit}`;
    }
  });
}

// 🔹 Initial Call to Disable Buttons If Needed
if (leftArrow && rightArrow) updatePaginationButtons();

if (signUpForm)
  signUpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordconfirm').value;
    signup({ name, email, password, passwordConfirm });
  });

if (loginForm)
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });

if (btnForgotPassword)
  btnForgotPassword.addEventListener('click', (e) => {
    // e.preventDefault();
    location.assign('/forgot-password');
  });

if (btnFP)
  btnFP.addEventListener('click', (e) => {
    e.preventDefault();
    const email = document.querySelector('.fp-email').value;
    forgotPassword(email);
  });

if (btnRP)
  btnRP.addEventListener('click', (e) => {
    e.preventDefault();
    const password = document.getElementById('password-rp').value;
    const passwordConfirm = document.getElementById('passwordconfirm-rp').value;
    resetPassword({ password, passwordConfirm });
  });

if (logoutBtn) logoutBtn.addEventListener('click', logout);

if (userDataForm)
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    updateAccount(form, 'data');
  });

if (userPasswordForm)
  userPasswordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    updateAccount({ passwordCurrent, password, passwordConfirm }, 'password');
  });

if (btnBook)
  btnBook.addEventListener('click', (e) => {
    e.target.textContent = 'processing';
    //tour-id in pug translated to tourId in JS
    const { tourId } = e.target.dataset;
    bookTour(tourId);
  });

if (btnCancelTour)
  btnCancelTour.addEventListener('click', (e) => {
    cancelTour(btnCancelTour.dataset.bookingid);
  });

if (btnAccpet)
  btnAccpet.addEventListener('click', (e) => {
    confirmTour(btnAccpet.dataset.bookingid);
  });

if (btnDecline)
  btnDecline.addEventListener('click', (e) => {
    rejectTour(btnDecline.dataset.bookingid);
  });

document.addEventListener('DOMContentLoaded', function () {
  const userImg = document.querySelector('.nav__user-img');

  if (userImg) {
    const tooltip = document.createElement('div');
    tooltip.innerText = userImg.getAttribute('alt');
    tooltip.style.position = 'absolute';
    tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    tooltip.style.color = 'white';
    tooltip.style.padding = '6px 12px';
    tooltip.style.borderRadius = '5px';
    tooltip.style.fontSize = '14px';
    tooltip.style.whiteSpace = 'nowrap';
    tooltip.style.visibility = 'hidden';
    tooltip.style.opacity = '0';
    tooltip.style.transition = 'opacity 0.3s ease-in-out';
    tooltip.style.pointerEvents = 'none'; // Prevents interaction issues
    tooltip.style.zIndex = '1000';
    document.body.appendChild(tooltip);

    userImg.addEventListener('mouseenter', (event) => {
      const rect = userImg.getBoundingClientRect();
      const tooltipWidth = tooltip.offsetWidth;

      // Position the tooltip above the image, centered
      tooltip.style.left =
        rect.left + window.scrollX + rect.width / 2 - tooltipWidth / 2 + 'px';
      tooltip.style.top = rect.bottom + window.scrollY + 5 + 'px'; // Shows below
      // Adjust for height

      tooltip.style.visibility = 'visible';
      tooltip.style.opacity = '1';
    });

    userImg.addEventListener('mouseleave', () => {
      tooltip.style.visibility = 'hidden';
      tooltip.style.opacity = '0';
    });
  }
});

document.addEventListener('DOMContentLoaded', function () {
  const toggleButton = document.getElementById('toggle-form');
  const formContainer = document.getElementById('password-form');
  const arrowIcon = toggleButton?.querySelector('img');

  toggleButton?.addEventListener('click', function () {
    // Toggle form visibility
    const isFormVisible = formContainer.style.display === 'block';
    formContainer.style.display = isFormVisible ? 'none' : 'block';

    // Rotate the arrow image (up/down)
    if (isFormVisible) {
      arrowIcon.classList.add('rotate-180'); // Reset to down
    } else {
      arrowIcon.classList.remove('rotate-180'); // Rotate to up
    }
  });
});

document.getElementById('menu-toggle')?.addEventListener('click', function () {
  document.querySelector('.user-view__menu').classList.toggle('active');
});

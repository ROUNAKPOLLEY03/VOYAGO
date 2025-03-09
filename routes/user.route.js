import express from 'express';

import {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
  uploadPhoto,
  resizeUserPhoto,
} from '../controllers/user.controller.js';

import {
  signup,
  login,
  forgotPassword,
  resetPassword,
  protectTourRoute,
  updatePassword,
  restrictTo,
  logout,
} from '../controllers/auth.controller.js';

export const router = express.Router();

router.route('/signup').post(signup);
router.post('/login', login);
router.get('/logout', logout);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

router.use(protectTourRoute); //Protect all the routes that comes after this point

router.get('/Me', getMe, getUser);
router.patch('/updateMyPassword', updatePassword);
router.patch('/updateMe', uploadPhoto, resizeUserPhoto, updateMe);
router.delete('/deleteMe', deleteMe);

router.use(restrictTo('admin'));

router.route('/').get(getAllUsers).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

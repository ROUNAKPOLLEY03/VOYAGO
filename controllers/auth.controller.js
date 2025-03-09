import { User } from '../models/user.model.js';
import { catchAsync } from '../utils/catchAsync.js';
import ApiError from '../utils/ApiError.js';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import { Email } from '../utils/email.js';
import crypto from 'crypto';

const cookieOption = {
  expires: new Date(
    Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
  ),
  httpOnly: true, // Ensures cookie cannot be accessed via JavaScript
  secure: process.env.NODE_ENV === 'production', // Only send over HTTPS
  sameSite: 'Strict', // Helps prevent CSRF attacks
};
const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  if (process.env.NODE_ENV === 'production') cookieOption.secure = true;
  res.cookie('jwt', token, cookieOption);
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
    algorithm: 'HS256',
  });

export const signup = catchAsync(async (req, res, next) => {
  //1) Collect only necessary infos
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });
  //sending welcome mail
  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(newUser, url).sendWelcome();
  //Remove password from output
  newUser.password = undefined;

  //2) Create unique JWT
  createAndSendToken(newUser, 201, res);
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //1) check if email and password exist
  if (!email || !password)
    return next(new ApiError('Please provide email and password', 400));
  //2) check if user exists and password is correct
  const user = await User.findOne({ email }).select('+password -__v');

  const correct = await user?.isCorrectPassword(password, user.password);

  if (!user || !correct)
    return next(new ApiError('Incorrect email or password', 401));
  //3) If everything is okay, send token to the client
  createAndSendToken(user, 200, res);
});

export const logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

export const protectTourRoute = catchAsync(async (req, res, next) => {
  //1) Get the token and check it
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ').at(1);
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token)
    return next(
      new ApiError('You are not logged in.Please log in to get access', 401),
    );
  //2) Verification of token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //3)check if user still exists
  const user = await User.findById(decoded.id);
  if (!user) return next(new ApiError('No user with the token found!', 401));
  //4) check if user changes password after the token was issued
  if (user.changedPasswordAfter(decoded.iat)) {
    return next(
      new ApiError('User recently changed password!please log in again', 401),
    );
  }
  //5) Grant access to the protected route
  req.user = user;
  res.locals.user = user;
  next();
});

export const isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      //1) Get the token and check it
      let token;
      if (req.cookies.jwt) {
        token = req.cookies.jwt;
      }

      if (!token) return next();
      //2) Verification of token
      const decoded = await promisify(jwt.verify)(
        token,
        process.env.JWT_SECRET,
      );
      //3)check if user still exists
      const user = await User.findById(decoded.id);
      if (!user) return next();
      //4) check if user changes password after the token was issued
      if (user.changedPasswordAfter(decoded.iat)) {
        return next();
      }
      //5) There is a logged in user(Pug templates will have access to the loacls)
      res.locals.user = user;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new ApiError("You don't have permission to perform this action", 403),
      );
    next();
  };
};

export const forgotPassword = catchAsync(async (req, res, next) => {
  //1) Get user based on posted email
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return next(new ApiError('Email ID Not Found!'), 404);
  }
  //2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  //3) send it to user email
  try {
    const resetURL = `${req.protocol}://${req.get('host')}/resetPassword/${resetToken}`;

    await new Email(user, resetURL).sendPasswordReset();
    return res.status(200).json({
      status: 'success',
      message: 'Token send to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new ApiError(
        'There was an error sending the email! Try again later!',
        500,
      ),
    );
  }
});

export const resetPassword = async (req, res, next) => {
  //1) Get the user based on the token
  const encryptedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: encryptedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  //2)If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new ApiError('Token is invalid or has expired'), 400);
  }
  if (req.body.password !== req.body.passwordConfirm)
    return next(
      new ApiError('Password and Password Confirm fields should be same'),
      400,
    );
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  //3)Update changedPasswordAt property for the user
  //4) Log the user in, send JWT
  createAndSendToken(user, 200, res);
};

export const updatePassword = catchAsync(async (req, res, next) => {
  //1) Get user from collection
  const user = await User.findById(req.user._id).select('+password');
  if (!user) return next(new ApiError('User not found!'), 404);
  //2) Check if posted current password is correct
  const isCorrectPassword = await user.isCorrectPassword(
    req.body.passwordCurrent,
    user.password,
  );
  if (!isCorrectPassword)
    return next(new ApiError('Your current password is wrong!'), 401);
  //3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  //4) Log user in, send JWT
  createAndSendToken(user, 200, res);
});

import User from '../models/usersModel.js';
import crypto from 'crypto';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import AppError from '../utils/appErrors.js';
import Email from '../utils/email.js';

import { log } from 'console';
dotenv.config();
// TOKEN CREATION //
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
//ANOTHER CREATESENDTOKEN FUNCTION AND ALSO USED TO SEND COOKIE//
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  // HOW TO CREATE A COOKIE//
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  //Remove the password from the output //
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

// SIGN UP USERS //
export const signUp = async (req, res, next) => {
  try {
    const newUser = await User.create(req.body);
    const url = `${req.protocol}://${req.get('host')}/me`;
    console.log(url);
    await new Email(newUser, url).sendWelcome();
    createSendToken(newUser, 201, res);
  } catch (err) {
    console.error('ERROR IN signUp:', err);
    // Optionally, you can delete the user if email fails, but for now, just return error
    return next(
      new AppError(
        'There was an error sending the welcome email. Please try again later!',
        500,
      ),
    );
  }
};
// LOGIN USERS //
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    //1) check if email and passord exist
    if (!email || !password) {
      return next(new AppError('please provide email and password!', 400));
    }
    //2) check if user exists && passord is correct
    const user = await User.findOne({ email }).select('+password');
    // const correct = await user.correctPassword(password, user.password);
    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Incorrect email or password', 401));
    }
    //3) check if everything ok, send token to clients
    createSendToken(user, 200, res);
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};
// AUTHENTICATING OR LOGGING USER IN //
export const protect = async (req, res, next) => {
  try {
    //1) Getting token and check if it's there
    let token;
    const authorizationHeader = req.headers.authorization;

    if (authorizationHeader && authorizationHeader.startsWith('Bearer')) {
      token = authorizationHeader.split(' ')[1];
      console.log('authorizationHeader:', authorizationHeader);
      console.log('token:', token);
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
      console.log('token from cookie:', token);
    }
    // check if the token actually exists
    if (!token) {
      return next(
        new AppError(
          'you are not logged in! please log in to get access.',
          401,
        ),
      );
    }
    //3) Verification token i.e this is where token payload is check if it is not been manipulated by some malicious third party
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    console.log(decoded);
    // 4) check if currentUser still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError('The user belonging to this token does not longer exist.'),
        401,
      );
    }
    // 5) check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      next(
        new AppError(
          'user recently changed password! please log in again',
          401,
        ),
      );
    }
    // Grant Access to Protected Route//
    req.user = currentUser;
    next();
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err });
  }
};
// Only for rendered pages, no errors!
export const isLoggedIn = async (req, res, next) => {
  try {
    //1) Getting token and check if it's there
    if (req.cookies.jwt) {
      // verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      );
      console.log(decoded);
      // 4) check if currentUser still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }
      // 5) check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }
      // There  is a logged in user
      req.locals.user = currentUser;
      return next();
    }
    next();
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err });
  }
};

//AUTHORIZATION USER ROLE && PERMISSION //
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles is an array i.e ['admin', 'lead-guide']
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError('you do not have permission to perform this action', 403),
      );
    }
    next();
  };
};

// FORGET PASSWORD FUNCTIONALITY //

export const forgotPassword = async (req, res, next) => {
  let user;
  try {
    //1) Get user based on posted email
    user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(new AppError('There is no user with email addresss', 404));
    } //2) generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    //3) send it back as user's email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();

    res
      .status(200)
      .json({ status: 'success', message: 'Token sent to email!' });
  } catch (err) {
    console.error('ERROR IN forgotPassword:', err);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500,
      ),
    );
  }
};
export const resetPassword = async (req, res, next) => {
  try {
    //1)Get user based on the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    //2)  Set the new password if only token has not expired, and there is user,
    if (!user) {
      return next(new AppError('Token is invalid or has expired', 404));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    User.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    //3) update changedPasswordAt property for the user
    //4) log the user in, send JWT
    createSendToken(user, 200, res);
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err });
  }
};

export const updatePassword = async (req, res, next) => {
  try {
    //1)  Get user from collection
    const user = await User.findById(req.user.id).select('+password');
    //2) check if posted current password is correct
    if (
      !(await user.correctPassword(req.body.passwordCurrent, user.password))
    ) {
      return next(new AppError('Your current password is wrong.', 401));
    }
    //3) if so, Updated password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    //4) log user in, send JWT
    createSendToken(user, 200, res);
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err });
  }
};

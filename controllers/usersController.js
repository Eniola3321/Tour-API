import User from '../models/usersModel.js';
import AppError from '../utils/appErrors.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({
      status: 'success',
      data: {
        users,
      },
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
export const updateMe = async (req, res, next) => {
  try {
    //1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new AppError(
          'This is not for password updates. Please use / updateMyPassword.',
          400,
        ),
      );
    }
    //2) Filtered out wanted fields names that are not allowed to be updated
    const filteredBody = filterObj(req.body, 'name', 'email');
    //3) Update user document
    const updatedUser = await findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser,
      },
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};
export const deleteMe = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user.id, { active: false });
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};
export const getUser = async (req, res) => {
  try {
    const user = User.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};
/*import fs from 'fs';

const users = JSON.parse(
  fs.readFileSync('./dev-data/data/users.json', 'utf-8')
);

export const getAllUsers = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      users: users,
    },
  });
};
export const createUser = (req, res) => {
  const newID = tours[tours.length - 1].id + 1;
  const newUser = Object.assign({ newID }, req.body);
  users.push(newUser);
  fs.writeFile('./dev-data/data/users.json', JSON.stringify(users), (err) => {
    res.status(201).json({
      status: 'sucess',
      data: {
        user: newUser,
      },
    });
  });
};
export const getUser = (req, res) => {
  const name = req.params.user * '';
  const user = users.find((el) => el.name === name);
  res.status(200).json({
    status: 'success',
    data: {
      user: user,
    },
  });
};
*/

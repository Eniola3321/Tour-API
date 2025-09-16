import multer from 'multer';
import sharp from 'sharp';
import User from '../models/usersModel.js';
import AppError from '../utils/appErrors.js';
import { deleteOne, updateOne } from './handlerFactory.js';
// Multer Configuring (is used to upload file like image, )
/*const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/users');
  },
  filename: (req, file, cb) => {
    // user-id-timestamp.jpeg
    const ext = file.mimetype.split('/')[1];
    cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
  },
});*/
const multerStorage = multer.memoryStorage(); // image will be store as a buffer;

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

// const upload = multer({ dest: 'public/img/users' });
export const uploadUserPhoto = upload.single('photo');
export const resizeUserPhoto = async (req, res, next) => {
  try {
    if (!req.file) return next();
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg `;
    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/users/${req.file.filename}`);
    next();
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

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
export const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
export const updateMe = async (req, res, next) => {
  try {
    //
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
    if (req.file) filteredBody.photo = req.file.filename;
    //3) Update user document
    const updatedMe = await User.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        user: updatedMe,
      },
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

export const deleteMe = async (req, res) => {
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
    const user = await User.findById(req.params.id);
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
//Do not use the passwords with this!
export const updateUser = updateOne(User);
export const deleteUser = deleteOne(User);

// export const updateUser = async (req, res) => {
//   try {
//     const tour = await Tour.findByIdAndUpdate(req.user.id, req.body, {
//       new: true,
//       runValidators: true,
//     });
//     res.status(200).json({
//       status: 'success',
//       data: {
//         tour,
//       },
//     });
//   } catch (err) {
//     res.status(404).json({ status: 'fail', message: err });
//   }
// };

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

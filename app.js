import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import xssClean from 'xss-clean';
import morgan from 'morgan';
import AppError from './utils/appErrors.js';
import globalErrorHandler from './controllers/errorController.js';
import userRouters from './routes/usersRouter.js';
import tourRouters from './routes/toursRouter.js';
import reviewRouter from './routes/reviewRouter.js';
import viewRouter from './routes/viewRouter.js';
import bookingRouter from './routes/bookingsRouter.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '/views'));

//*)GLOBAL MIDDLEWARES
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
// app.use(express.json('./public'));
// Set Security HTTP headers
app.use(helmet());
// Development Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour',
});
app.use('/api', limiter);
//1) MIDDLEWARES
// Body parser, reading data from body into req.body
app.use(express.json());

// Parse cookies
app.use(cookieParser());

// Data sanitization against NoSQL query Injection
app.use(mongoSanitize());
//Data sanitization against cross-site scripting attacks
app.use(xssClean());
// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      '"ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);
// Serving static files

// routes handler
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouters);
app.use('/api/v1/users', userRouters);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server!`));
  // // res.status(404).json({
  // //   status: 'fail',
  // //   message: `can't find ${req.originalUrl} on this server!`,
  // const err = new Error(`can't find ${req.originalUrl} on this server!`);
  // err.status = 'fail';
  // err.status = 404;
  // // });
});
app.use(globalErrorHandler);
//4) START SERVER
export default app;
/*const tours = JSON.parse(
  fs.readFileSync('./dev-data/data/tours-simple.json', 'utf-8')
);
const users = JSON.parse(
  fs.readFileSync('./dev-data/data/users.json', 'utf-8')
);*/
//2) Route Handlers
/*
const getAllTours = (req, res) => {
  res.status(200).json({
    status: 'sucess',
    requestAt: req.requestTime,
    result: tours.length,
    data: {
      tours,
    },
  });
};
const createTours = (req, res) => {
  const newID = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ newID }, req.body);
  tours.push(newTour);
  fs.writeFile(
    './dev-data/data/tours-simple.json',
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'sucess',
        data: {
          tour: newTour,
        },
      });
    }
  );
};
const getTour = (req, res) => {
  console.log(req.params);
  const id = req.params.id * 1;
  const tour = tours.find((el) => el.id === id);
  // if (!tour) {
  if (id > tours.length) {
    res.status(404).json({ status: 'fail', msg: 'Invalid Tour' });
  }
  res.status(200).json({
    status: 'sucess',
    data: {
      tour: tour,
    },
  });
};

const updateTours = (req, res) => {
  if (req.params.id * 1 > tours.length) {
    res.status(404).json({ status: 'fail', msg: 'Invalid Tour' });
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour: '< Updated tour here... >',
    },
  });
};*/
/*const getAllUsers = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      users: users,
    },
  });
};
const createUser = (req, res) => {
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
const getUser = (req, res) => {
  const name = req.params.user * '';
  const user = users.find((el) => el.name === name);
  res.status(200).json({
    status: 'success',
    data: {
      user: user,
    },
  });
};*/

/* app.get('/api/v1/tours', getAllTours);
 app.post('/api/v1/tours', createTours);
 app.get('/api/v1/tours/:id', getTour);
 app.patch('/api/v1/tours/:id', updateTours);
app.get('/api/v1/users', getAllUsers);
 app.post('/api/v1/users', createUser);
 app.get('/api/v1/users/:user', getUser);*/
//3) Routes
/*
app.route('/api/v1/tours').get(getAllTours).post(createTours);
app.route('/api/v1/tours/:id').get(getTour).patch(updateTours);
app.route('/api/v1/users').get(getAllUsers).post(createUser).get(getUser);
*/

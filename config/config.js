import dotenv from 'dotenv';
dotenv.config();
export default {
  port: process.env.PORT || 2005,
  env: process.env.NODE_ENV || 'development',
  database: {
    mongoDb: {
      Url: process.env.MONGO_URL,
    },
  },
};

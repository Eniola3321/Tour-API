import mongoose from 'mongoose';
import config from './config.js';

const connectDb = async () => {
  try {
    await mongoose.connect(config.database.mongoDb.Url);
    console.log(`Db is connected successfully`);
  } catch (err) {
    `Error occurred while connecting: ${err?.message ? err.message : err}`;
  }
};
export default connectDb;

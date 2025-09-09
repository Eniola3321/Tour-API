import fs from 'fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Tour from '../../models/toursModel.js';
import User from '../../models/usersModel.js'; // Import User model
import Review from '../../models/reviewModel.js';
// dotenv.config({ path: '../../.env' });

// Use hardcoded URL since dotenv loading is not working
const mongoUrl = 'mongodb://localhost:27017/toursDB';
mongoose.connect(mongoUrl).then(console.log('mongo connect successful'));

// Read JSON File
const tour = JSON.parse(fs.readFileSync('./dev-data/data/tours.json', 'utf-8'));
const user = JSON.parse(
  fs.readFileSync('./dev-data/data/users.json', 'utf-8'), // Read users.json
);
const review = JSON.parse(
  fs.readFileSync('./dev-data/data/reviews.json', 'utf-8'), // Read users.json
);
// Import Data into Database
const importData = async () => {
  try {
    await Tour.create(tour);
    await User.create(user, { validateBeforeSave: false });
    await Review.create(review);

    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

//DELETE ALL DATA FROM DB
const delData = async () => {
  try {
    // Drop collections to ensure complete cleanup
    await mongoose.connection.dropCollection('tours');
    await mongoose.connection.dropCollection('users');
    await mongoose.connection.dropCollection('reviews');

    console.log('Collections dropped successfully');
  } catch (err) {
    // If collections don't exist, just delete documents
    console.log(
      'Dropping collections failed, deleting documents instead:',
      err.message,
    );
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Documents deleted successfully');
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  delData();
}

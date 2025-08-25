// import fs from 'fs';
// import mongoose from 'mongoose';
// import dotenv from 'dotenv';
// import Tour from '../../models/toursModel.js';
// dotenv.config({ path: './config.env' });
// // console.log(app.get('env'));
// // console.log(process.env);

// const mongoUrl = 'mongodb://localhost:27017/toursDB';
// mongoose.connect(mongoUrl).then(console.log('mongo connect sucessful'));
// // Read JSON File
// const tours = JSON.parse(
//   fs.readFileSync('./dev-data/data/tours-simple.json', 'utf-8'),
// );

// // Import Data into Database
// const importData = async () => {
//   try {
//     await Tour.create(tours);
//     console.log('Data successfully loaded!');
//   } catch (err) {
//     console.log(err);
//   }
//   process.exit();
// };
// // importData();
// //DELETE ALL DATA FROM DB
// const delData = async () => {
//   try {
//     await Tour.deleteMany();
//   } catch (err) {
//     console.log(err);
//   }
//   process.exit();
// };

// if (process.argv[2] === '--import') {
//   importData();
// } else if (process.argv[2] === 'delete') {
//   delData();
// }

import mongoose from 'mongoose';
// import User from './usersModel.js'; for embedded Tour guide
import slugify from 'slugify';
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      maxlength: [40, 'A tour name must have less or equal than 40 character '],
      minlength: [10, 'A tour name must have more or equal than 10 character '],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult', 'hard'],
        message: ['Difficulty is either: easy, medium, hard, difficult'],
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val) => Math.random(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price; // 100 < 200;
        },
        message: 'Discount price ({VALUE})should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    secretTours: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    startLocation: {
      //GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    // guides: Array, for enbedded Tour guide(user)
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },

    toObject: { virtuals: true },
  },
);
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });
tourSchema.virtual('durationWeek').get(function () {
  return this.duration / 7;
});
// VirtualPopulate
tourSchema.virtual('review', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});
//1) Document Middleware: runs before .save() and .create() command
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
//Reference User into Tour(guides)
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});
/* Embedded User into TourModel(guides)
tourSchema.pre('save', async function (next) {
  const guidesPromise = this.guides.map(async (id) => await User.findById(id));
  this.guides = await Promise.all(guidesPromise);
  next();
});*/
/*tourSchema.pre('save', function (next) {
  console.log('Will save document...');
  next();
});
tourSchema.post('save', function (doc, next) {
  console.log(doc);
  next();
});*/
//2) Query Middlewares
tourSchema.pre(/^find/, function (next) {
  // tourSchema.pre('find', function (next) {
  this.find({ secretTours: { $ne: true } });
  this.start = Date.now();
  next();
});
tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start}milliseconds!`);
  console.log(docs);
  next();
});
//3) Aggregate Middlewares
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTours: { $ne: true } } });
//   console.log(this);
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);
export default Tour;
/* //IT IS USED TO TEST OR CHECK IF OUR DATABASE IS WORKING//
const testTour = new Tour({
  name: 'The Park Camper',
  price: 997,
});
testTour
  .save()
  .then((doc) => console.log(doc))
  .catch((err) => console.log('error💥:', err));
*/

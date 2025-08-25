export default class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  // Advance Filters
  filter() {
    const queryObj = { ...this.queryString };
    const excludedField = ['sort', 'limit', 'page', 'fields'];
    excludedField.forEach((el) => delete queryObj[el]);
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }
  //2) Sorting
  sort() {
    if (this.queryString.sort) {
      this.query = this.query.sort(this.queryString.sort);
      // let sortBy = this.queryString.sort(',').join('');
      this.query = this.query.sort(sortBy);
      //sort('price,ratingsAverage');
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  //3) Field Limiting
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }
  paginate() {
    //4) Pagination
    const page = this.queryString.page * 1 || 1; // default value
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;
    //page=2&limit=10, skip 1-10 result from page1, start from 11-20, page2,
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

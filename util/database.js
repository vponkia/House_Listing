const mongoose = require('mongoose');
const config = require('./config');

mongoose.connect(config.db.uri, config.db.options)
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

module.exports = mongoose;
const mongoose = require('../util/database');

const userSchema = new mongoose.Schema({
  userID: String,
  username: String,
  email: String,
  password: String
}, { strict: true });

const SignUpIn = mongoose.model('SignUpIn', userSchema);

module.exports = SignUpIn;

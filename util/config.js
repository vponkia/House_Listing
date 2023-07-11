require('dotenv').config();

const uri =  `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}${process.env.DB_CLUSTER}/${process.env.DB_DATABASE}`;;

const config = {
  db: {
    uri: uri,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  }
};

module.exports = config;
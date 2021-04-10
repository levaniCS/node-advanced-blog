require('../models/User')

const mongoose = require('mongoose')
const keys = require('../config/keys')


mongoose.Promise = global.Promise
mongoose
  .connect(keys.mongoURI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('[TEST] DB connection successful!'));
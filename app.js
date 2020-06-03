const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const passport = require('passport');
const fileUpload = require('express-fileupload');
const mongoose = require('mongoose');

const app = express();

require('dotenv').config();
//Passport configuration
require('./config/passport')(passport);


//Configurations
app.use(cors());
app.use(bodyParser.json());

app.use(passport.initialize());
app.use(passport.session());

app.use(fileUpload());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

//Routes
app.use('/api', require('./routes/index'));


const PORT = process.env.PORT || 5000;

console.log(process.env.DB_PATH);

mongoose.connect(`mongodb://${process.env.DB_PATH || 'localhost'}/oer?authSource=admin`, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useCreateIndex: true
}, () => {
    console.log('Mongo is up!');
});

app.listen(PORT, console.log(`Server started on port ${PORT}`));

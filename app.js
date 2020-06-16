const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const passport = require('passport');
const fileUpload = require('express-fileupload');
const mongoose = require('mongoose');

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

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

const dbPath = `mongodb://${process.env.DB_PATH || 'localhost'}/oer`;

try {
    mongoose.connect(dbPath, 
        { 
            useNewUrlParser: true, 
            useUnifiedTopology: true,
            useCreateIndex: true
        }, (err) => {
            console.log('Mongo is up!');
        });
} catch(e) {
    console.log(e.message);
}

app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        message: error.message
    });
});

app.listen(PORT, console.log(`Server started on port ${PORT}`));

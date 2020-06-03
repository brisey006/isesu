const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const passport = require('passport');
const fileUpload = require('express-fileupload');

const app = express();

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

app.listen(PORT, console.log(`Server started on port ${PORT}`));
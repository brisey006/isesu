const express = require('express');
const router = express.Router();
const path = require('path')
const uuidv4 = require('uuid/v4');

router.use('/users', require('./users'));
router.use('/groups', require('./learning-groups'));
router.use('/levels', require('./levels'));
router.use('/subjects', require('./subjects'));
router.use('/topics', require('./topics'));
router.use('/competences', require('./competences'));
router.use('/resources', require('./resources'));
router.use('/reviews', require('./reviews'));
router.use('/search', require('./search'));
router.use('/forum', require('./forum'));
router.use('/profiles', require('./profile'));

router.post('/upload', function(req, res) {
    if (Object.keys(req.files).length == 0) {
      return res.status(400).send('No files were uploaded.');
    }

    let file = req.files.file;
    let fileName = req.files.file.name;
    let ext = path.extname(fileName);
    let finalFile = `uploads/${uuidv4()+ext}`;
    
    file.mv('/var/www/html/'+finalFile, function(err) {
      if (err){
          console.log(err);
      }
  
      res.send(finalFile);
    });
});

module.exports = router;
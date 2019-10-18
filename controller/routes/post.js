var express = require('express');
var multer = require('multer');
var path = require('path');
var uuid = require('uuid');
var router = express.Router();

var storage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, './uploads')
  },
  filename: function(req, file, cb){
    //cb(null, Date.now() + path.extname(file.originalname)) // template: this renames to "current datetime + file type extension" only
    cb(null, uuid.v4() + '-' + Date.now() + '-' + file.originalname) //https://bit.ly/2J0AHuT
  }
})

var upload = multer({storage: storage})


/* GET users listing. */
router.post('/', upload.any(), function(req, res, next) {
  console.log(req.body, 'Body');
  console.log(req.files, 'files');
  //res.send('post response');
  res.render('post', { title: 'Data uploaded' });
});

module.exports = router;

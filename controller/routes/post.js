var express = require('express');
var multer = require('multer');
var path = require('path');
var uuid = require('uuid');
var redis = require('redis')
var bluebird = require('bluebird')
var fs = require('fs')
var router = express.Router();

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

var storage = multer.diskStorage({
  destination: function(req, file, cb){
    cb(null, './uploads')
  },
  filename: function(req, file, cb){
    //cb(null, Date.now() + path.extname(file.originalname)) // template: this renames to "current datetime + file type extension" only

    cb(null, uuid.v4() + '+' + Date.now() + '+' + file.originalname) //https://bit.ly/2J0AHuT
  }
})

var upload = multer({storage: storage})

async function testCache(file){

  // Connect to the Azure Cache for Redis over the SSL port using the key.
  var cacheConnection = redis.createClient(6380, process.env.REDISCACHEHOSTNAME,{auth_pass: process.env.REDISCACHEKEY, tls: {servername: process.env.REDISCACHEHOSTNAME}});

  // Perform cache operations using the cache connection object...
  /*
    // Simple PING command
    console.log("\nCache command: PING");
    console.log("Cache response : " + await cacheConnection.pingAsync());

    // Simple get and put of integral data types into the cache
    console.log("\nCache command: GET Message");
    console.log("Cache response : " + await cacheConnection.getAsync("Message"));    

    console.log("\nCache command: SET Message");
    console.log("Cache response : " + await cacheConnection.setAsync("Message",
        "Hello! The cache is working from Node.js!"));    

    // Demonstrate "SET Message" executed as expected...
    console.log("\nCache command: GET Message");
    console.log("Cache response : " + await cacheConnection.getAsync("Message"));    

    // Get the client list, useful to see if connection list is growing...
    console.log("\nCache command: CLIENT LIST");
    console.log("Cache response : " + await cacheConnection.clientAsync("LIST"));   
  */
  console.log(__dirname)
  //let thisJSON = require('../uploads/'+file)
  let filepath = path.join(__dirname, '..', 'uploads', file)
  fs.readFile(filepath,'utf8', async function(err, data) {
    if(err){
      throw err;
    }
    content = data;

    console.log("\nCache command: SET Message");
    console.log("Cache respone: " +  await cacheConnection.setAsync(file, content));
    
    console.log("\nCache command: GET Message");
    console.log("Cache response : " +  await cacheConnection.getAsync(file));

    console.log("\nDeleting temp upload from server...")
    
    fs.unlink(filepath, (err) => {
      if(err) {
        throw err;
      }
      console.log("Temporary upload deleted")
    })
  })   
}

/* GET users listing. */
router.post('/', upload.any(), function(req, res, next) {
  console.log("filename is: " + req.files[0].filename)

  testCache(req.files[0].filename);
  //res.send('post response');
  uniqueID = String(req.files[0].filename).split("+", 1)
  res.render('post', { title: 'Data has been uploaded', uuid: uniqueID });
});

module.exports = router;

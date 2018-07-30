'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
const dns = require('dns');
require('dotenv').config();
var cors = require('cors');
var urlCheck = require("url");
var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

// connection to db
mongoose.connect(process.env.MONGOLAB_URI, {
  useMongoClient: true
  });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("we're connected to the db!");
});
const urldbSchema = new mongoose.Schema({
  original_url: String,
  short_url : Number
});
const Urls = mongoose.model('Urls', urldbSchema);


app.use(cors());

/** this project needs to parse POST bodies **/
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// ENDPOINTS...

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});
  
app.get("/api/shorturl/:shorturl", function (req, res) {
  let query = {};
  query.short_url = Number(req.params.shorturl);
  Urls.findOne(query,function (err, url) {
    if (err) return console.error(err);
    res.redirect(url.original_url);
  });

});

app.post("/api/shorturl/new", function (req,res,next){
  // check if valid link
  var result = urlCheck.parse(req.body.url);
  console.log(result);
  if (result.protocol) next();
  let output = {"error" : "invalid URL"};
  res.json(output);
    
  } , (req,res) => {
  // store link in db  
  let url = req.body.url;
  Urls.count((err, count) => {
    if (err) return console.error(err);
    var newUrl = new Urls();
    newUrl.original_url = url;
    newUrl.short_url= count;
    newUrl.save((err) => {
      if (err) return console.error(err);
    });
    res.json(newUrl);
  });
  
  Urls.find(function (err, urls) {
    if (err) return console.error(err);
    console.log(urls);
  });

})


Urls.find(function (err, urls) {
  if (err) return console.error(err);
  console.log(urls);
});



app.listen(port, function () {
  console.log('Node.js listening ...');
});
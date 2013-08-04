
var express = require('express');
var http = require('http');
var tolstoy = require('./tolstoy');
var app = express();
var sniff = require('./sniff');
var util = require('util');


/*
 * Set up the server */
app.use(express.logger());
app.use(express.static(__dirname + '/public'));

app.get('*', function(req,res) { 

  res.send("Hi, nothing to see, move along...");

});

app.listen(3000); 


/*
 * Poll the Dropbox API every 3 seconds */
setInterval( function(){

  console.log("interval fire");
  console.log(util.inspect(sniff.parse('posts'), false, null));
  console.log("------\n");

}, 3000 );



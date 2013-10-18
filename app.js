
var express = require('express');
var http = require('http');
var tolstoy = require('./tolstoy');
var app = express();
var sniff = require('./sniff');
var util = require('util');
var fs = require('fs');



/*
 * Set up the server */
app.use(express.logger());
app.use(express.static(__dirname + '/public'));

app.get('*', function(req,res) { 
  res.send("Hi, nothing to see, move along...");
});
app.listen(3000); 


tolstoy.init('db.json', '_posts', function(targetDir){
  setTimeout(function(){

  var outputFile = '_posts.json';
    fs.writeFile(outputFile, JSON.stringify(sniff.parse(targetDir)), function(err){
      console.log("Writing json to " + outputFile);
      if(err) throw err;
    });

  }, 3000);
});

/*
 * Poll the Dropbox API every 5 seconds */
setInterval( function(){

  console.log("interval fire");
  tolstoy.deltaSync();

}, 5000 );


//var targetDir = '_posts';
//fs.writeFile(outputFile, JSON.stringify(sniff.parse(targetDir)), function(err){
//  console.log("Writing json to " + outputFile);
//  if(err) throw err;
//});



var appkey = '9fij6hc7lspy8yl';
var appsecret = 'iw6ghnu3k4bbky7';

var requestToken = 'g31xkn4lky13sfx';
var requestTokenSecret = 'vsygntawfqiza5s';

var accessToken = 'lpvqwbncj1allu6';
var accessTokenSecret = 'ibc7fxln5qwwwlx';


var express = require('express');
var http = require('http');
var tolstoy = require('./tolstoy');
var app = express();

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
  tolstoy.checkForUpdates();

}, 3000 );



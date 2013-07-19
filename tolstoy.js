'use strict';

var tolstoy = tolstoy || {};
var Dropbox = require('dropbox');
var request = require('request');
var qs = require('querystring')
var creds = require('./creds');
/* Reveals creds at:
creds.appkey
creds.appsecret
creds.requestToken
creds.requestTokenSecret
creds.accessToken
creds.accessTokenSecret
*/

tolstoy.metadata = function() {

  var url = 'https://api.dropbox.com/1/metadata/sandbox/';
  var headers = { "Authorization": 'OAuth oauth_version="1.0", oauth_signature_method="PLAINTEXT", oauth_consumer_key="'+ creds.appkey +'", oauth_token="'+ creds.accessToken + ', oauth_signature="'+ creds.appsecret + '&' + creds.accessTokenSecret + '"'};
  request.get({url:url, headers: headers, json:true}, function(err, res) {
    if(err) {
      console.log("err: ");
      console.log(err);
    } else if (res.statusCode === 200) {
      console.log(res);
    }
  });
 

}

tolstoy.authenticate = function() {


}

tolstoy.getClient = function() {


}


/* 
 * Initial ping to Dropbox, 
 * check metadata for data --
 * checks against last known hash.
 *
 * Calls handleResponse after making request */
tolstoy.checkForUpdates = function(){


}

tolstoy.handleResponse = function() {


}


module.exports = tolstoy;


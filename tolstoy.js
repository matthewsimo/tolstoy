'use strict';

var tolstoy = tolstoy || {};

var Dropbox = require('dropbox');
var request = require('request');
var qs = require('querystring')
var fs = require('fs-extra');
var creds = require('./creds');


/* Vars for working with Dropbox API */
var headers = { "Authorization": 'OAuth oauth_version="1.0", oauth_signature_method="PLAINTEXT", oauth_consumer_key="'+ creds.appkey +'", oauth_token="'+ creds.accessToken + ', oauth_signature="'+ creds.appsecret + '&' + creds.accessTokenSecret + '"'};
var api = 'https://api.dropbox.com/1/';
var apiC = 'https://api-content.dropbox.com/1/';

/* App setting vars */
var targetDir = '_posts';
var assetsDir = 'public/post-assets';
var deltaFile = 'db.json';
var syncCompleteCB;


/* Useful regexes */
var draftRegex = new RegExp(/^\/_drafts/);
var mdRegex = new RegExp(/.(md|markdown)$/);


tolstoy.init = function(file, directory, CB){
  deltaFile = file;
  targetDir = directory;
  syncCompleteCB = CB;
};


tolstoy.deltaSync = function() {

  var d_headers = headers;
  d_headers['content-type'] = 'application/x-www-form-urlencoded';

  var cursor = tolstoy.getCursor();
  var body = '';

  if(cursor)
    body = 'cursor='+cursor;

  var url = api + 'delta';
  request.post({url:url, headers: d_headers, json:true, body:body }, function(err, res) {
    if(err) {
      throw err;
    } else if (res.statusCode === 200) {
      var output = deltaFile;
      fs.outputFile(output, JSON.stringify(res.body), function(err){
        console.log("Writing " + output);
        if(err) throw err;

        if(res.body.entries.length)
          tolstoy.sync(res.body.entries);
      });
    } 
  });

};         


tolstoy.getCursor = function() {

  var file = deltaFile;

  if(fs.existsSync(file)) {
    var fileContent = JSON.parse(fs.readFileSync(file, 'utf-8'));
    return fileContent.cursor;
  } else {
    return '';
  };

};


tolstoy.sync = function(updateList){

  var length = updateList.length;
  for(var i = 0; i < length; i++){

    var item = updateList[i];

    if(tolstoy.isDraft(item[0]))
      console.log(item[0] + " is a draft - skipping");  
    else if(item[1] === null)
      tolstoy.removeItem(item);
    else if(item[1].is_dir)
      tolstoy.updateDir(item);
    else
      tolstoy.updateFile(item);

  }

  syncCompleteCB(targetDir);

};

tolstoy.removeItem = function(itemObject){
  var itemName = itemObject[0]; 
  var output = targetDir + itemName;

  if(!fs.existsSync(output))
    return;

  fs.lstat(output, function(err, stats) {
    if(err) throw err;

    if (stats.isDirectory()) {
      fs.rmdir(output, function(err){
        if(err) throw err;
        console.log("Deleted directory: " + output);
      });
    } else {
      fs.unlink(output, function(err){
        if(err) throw err;
        console.log("Deleted file: " + output);
      });
    }
  }); 
};

tolstoy.updateDir = function(dirObject){
  var dirName = dirObject[0]; 
  var output = targetDir + dirName;
  console.log("Updating directory: " + dirName);

  // Check if dir exists at targetDir + dirName
  //
  // if exists & is file
  //    -- remove file, add directory
  // else !exists
  //    -- add directory

};


tolstoy.updateFile = function(fileObject){
  var fileName = fileObject[0];

  if(fs.existsSync(output) && fs.lstatSync(output).isDirectory()){
    fs.rmdirSync(output);
  }

  console.log("Updating file: " + fileName + " at: " + output);

  var url = apiC + 'files/sandbox/' + fileName;

  if(tolstoy.isMarkdown(fileName)) { 

    var output = targetDir + fileName;

    request.get({url:url, headers: headers}, function(err, res) {
      if(err) {
        throw err;
      } else if (res.statusCode === 200) {
        fs.outputFile(output, res.body, 'binary', function(err){
          console.log("File " + output + " written");
          if(err) throw err;
        });
      }
    });

  } else {

    var output = assetsDir + fileName;


    if(!fs.existsSync(output)) {
      fs.createFile(output, function(err){
        if(err) throw err;

        var r = request.get({url:url, headers: headers}, function(err, res) {
          if(err) throw err;
        });

        r.pipe(fs.createWriteStream(output));
        r.on('end', function(){
          console.log("Done writing stream to file: " + output);
        });

      });
    }


  }

};


tolstoy.isDraft = function(itemName){
  var r = itemName.match(draftRegex);

  if(r === null)
    return false;
  else
    return true;

};

tolstoy.isMarkdown = function(fileName){
  var r = fileName.match(mdRegex);

  if(r === null)
    return false;
  else
    return true;

};

module.exports = tolstoy;

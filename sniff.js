var fs = require('fs'),
    path = require('path'),
    sniff = sniff || {}

/* Parse
 * Accepts a directory path
 * Returns root/children in json object
 */
sniff.parse = function(root) {

    var stats = fs.lstatSync(root),
        info = {
            path: root,
            name: path.basename(root)
        };

    if (stats.isDirectory()) {
        info.type = "folder";
        info.content = fs.readdirSync(root).map(function(child) {
            return sniff.parse(root + '/' + child);
        });
    } else {
        // Assuming it's a file. In real life it could be a symlink or
        // something else!
        info.type = "file";

        var fileContent = fs.readFileSync(root, 'utf-8');

        var metaRegExp = new RegExp(/\{(\s|\S)+\}/);
        var meta = fileContent.match(metaRegExp);
        info.meta = {};

        if(meta !== null) {
          info.meta = JSON.parse(meta[0]);
          info.content = fileContent.replace(meta[0], "");
        } else {
          info.content = fileContent;
        }

        info.meta.slug = sniff.calcSlug(info.name);
        info.meta.date = sniff.calcDate(info.path);

    }

    return info;
}

sniff.calcSlug = function(fileName) {

  var fileRegExp = new RegExp(/^\d+-([\w\d-]*)\.md/);
  var r = fileName.match(fileRegExp);
  return r[1];

}

sniff.calcDate = function(filePath) {

  var dateRegExp = new RegExp(/\d\d\d\d\/\d\d\/\d\d/);
  var r = filePath.match(dateRegExp);
  return new Date(r[0]);

}

module.exports = sniff;

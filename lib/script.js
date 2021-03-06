/*global require, exports */

"use strict";

var fs = require('fs'),
    browserify = require('browserify');

function runBrowserify(name, src, dest, callback) {
    var b = browserify();
    b.require(src, {}); // expose: name
    b.transform({}, 'debowerify');
    b.transform({}, 'textrequireify');
    b.bundle({
        debug: true
    }, function(error, result) {
        if (dest) {
            fs.writeFileSync(dest, result, { encoding: "utf-8" });
        }
        error && console.log(error);
        callback(error, result);
    });
}

exports.runBrowserify = runBrowserify;

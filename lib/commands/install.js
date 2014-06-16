/*global require, exports, process */

var path = require('path'),
    async = require('async'),
    semver = require('semver'),
    log = require('../log'),
    commandLine = require('../command-line'),
    verify = require('../verify'),
    files = require('../files'),
    requiredSassGemVersion = "3.3.3",
    requiredScssLintGemVersion = "0.24.1",
    requiredBowerVersion = "1.3.1",
    childProcess = require("child_process");

function getGemVersion(gem, callback) {
    "use strict";
    childProcess.exec(gem + ' --version', function(err, stdout) {
        if (err) {
            callback(-1);
        } else {
            var re = new RegExp(/\d+(\.\d+)+/),
                version = stdout.trim().match(re);
            if (version) {
                callback(version[0]);
            } else {
                callback(-1);
            }
        }
    });
}

function getInstalledSassGemVersion(callback) {
    "use strict";
    getGemVersion('sass', callback);
}

function getInstalledScssLintGemVersion(callback) {
    "use strict";
    getGemVersion('scss-lint', callback);
}

function getInstalledBowerVersion(callback) {
    "use strict";
    commandLine.run(path.join(process.cwd(), '/node_modules/bower/bin/bower'), ['--version'], function(err, result) {
        if (!err) {
            callback(result.trim() || -1);
        } else {
            callback(-1);
        }
    });
}


exports.run = function() {
    "use strict";

    var sassTasks,
        generalTasks,
        runTasks;

    sassTasks = [
        function(callback) {
            getInstalledSassGemVersion(function(version) {
                if (version === -1 || semver.lt(version, requiredSassGemVersion)) {
                    log.primary("Install sass gem");
                    commandLine.run('gem', ['install', 'sass', '-v', requiredSassGemVersion], callback);
                } else {
                    log.secondary("sass gem " + version + " already installed.");
                    callback();
                }
            });
        },
        function(callback) {
            getInstalledScssLintGemVersion(function(version) {
                if (version === -1 || semver.lt(version, requiredScssLintGemVersion)) {
                    log.primary("Install sass gem");
                    commandLine.run('gem', ['install', 'scss-lint', '-v', requiredScssLintGemVersion], callback);
                } else {
                    log.secondary("scss-lint gem " + version + " already installed.");
                    callback();
                }
            });
        }
    ];

    generalTasks = [
        function(callback) {
            getInstalledBowerVersion(function(version) {
                if (version === -1 || semver.lt(version, requiredBowerVersion)) {
                    log.primary("Install Bower...");
                    commandLine.run('npm', ['install', 'bower'], callback);
                } else {
                    log.secondary("Bower " + version + " already installed");
                    callback();
                }
            });
        },
        function(callback) {
            if (files.packageJsonExists()) {
                log.primary("npm install...");
                commandLine.run('npm', ['install'], callback);
            } else {
                log.secondary("no package.json, skip npm install...");
                callback();
            }
        },
        function(callback) {
            if (files.bowerJsonExists()) {
                log.primary("bower install...");
                commandLine.run(path.join(process.cwd(), '/node_modules/bower/bin/bower'), ['install', '--config.registry.search=http://registry.origami.ft.com', '--config.registry.search=https://bower.herokuapp.com'], callback);
            } else {
                log.secondary("no bower.json, skip bower install...");
                callback();
            }
        }
    ];

    if (verify.mainSass()) {
        runTasks = sassTasks.concat(generalTasks);
    } else {
        runTasks = generalTasks;
    }

    async.series(runTasks, function(err) {
        if (err) {
            log.primaryError(err);
        } else {
            log.primary("Install successful.");
        }
    });
};
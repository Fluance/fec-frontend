'use strict';

var gulp = require('gulp');
var rsync = require('gulp-rsync');
var GulpSSH = require('gulp-ssh');
var rename = require('gulp-rename');
var plug = require('gulp-load-plugins')();
var log = plug.util.log;
var paths = require('../gulp.config.json');
var runSequence = require('run-sequence');
var del = require('del');
var lazypipe = require('lazypipe');
var prompt = require('gulp-prompt');
var env = plug.util.env;
var git = require('gulp-git');

var karmaConf = require('./karma.conf.js');

// Data from prompt
var stream;

/*
 *
 * TEST TASKS
 *
 * Tasks which pre- or post-process data for other TEST tasks
 *
 ********************************************************************************************************************
 */

/**
 * Run specs once and exit
 * @return {Stream}
 */

gulp.task('test', ['test:clean'], function(done) {

    // List all files to inject when running test
    var files = [];
    // Load karmaConf and save generated file list (bower & co)
    karmaConf({
        set: function(values) {
            files = values.files;
        }
    });
    // remove all tests from files list to just keep app source code.
    files.splice(files.indexOf('./src/client/app/**/*.spec.js'), 1);
    files.splice(files.indexOf('./test/src/**/*.js'), 1);

    log('-------------------------------------------------------------');
    log('Run $> git diff to see changed spec.js file to run');
    // get list of changed files usgin $> git status
    git.status({ args: '--porcelain' }, function(err, stdout) {
        var counter = 0; // count file number
        var lines = stdout.toString().split('\n');
        // For each file we only keep the one ending with .spec.js
        lines.forEach(function(line) {
            var parts = line.split(' ');
            if (parts.length === 3 && parts[2].endsWith('.spec.js')) {
                files.push(parts[2]);
                counter++;
            }
        });
        log('Found ' + counter + ' file(s) ending with .spec.js to run in karma.');
        log('--------------------------------------------------------------');
        // Run tests with changed files
        startTests(true, done, files);
    });
});

gulp.task('test:all', ['test:clean'], function(done) {
    startTests(true /*singleRun*/, done);
});

/**
 * Run specs once and exit
 * @return {Stream}
 */
gulp.task('test:clean', function(done) {
    del(paths['test_results']);
    return gulp.src('').pipe(plug.notify({
        onLast: true,
        message: 'Cleaned test results!'
    }));
});

/**
 * Start the tests using karma.
 * @param  {boolean} singleRun - True means run once and end (CI), or keep running (dev)
 * @param  {Function} done - Callback to fire when karma is done
 * @return {undefined}
 */
function startTests(singleRun, done, files) {
    var child;
    var excludeFiles = [];
    var fork = require('child_process').fork;
    var karma = require('karma').server;

    if (env.startServers) {
        log('Starting servers');
        var savedEnv = process.env;
        savedEnv.NODE_ENV = 'dev';
        savedEnv.PORT = 8888;
        child = fork('src/server/app.js', childProcessCompleted);
    } else {
        excludeFiles.push('./src/client/app/**/*.test.js');
    }

    var options = {
        configFile: __dirname + '/karma.conf.js',
        exclude: excludeFiles,
        singleRun: !!singleRun
    };

    if (files) {
        options.files = files;
    }

    karma.start(options, karmaCompleted);

    ////////////////

    function childProcessCompleted(error, stdout, stderr) {
        log('stdout: ' + stdout);
        log('stderr: ' + stderr);
        if (error !== null) {
            log('exec error: ' + error);
        }
    }

    function karmaCompleted() {
        if (child) {
            child.kill();
        }
        done();
    }
}

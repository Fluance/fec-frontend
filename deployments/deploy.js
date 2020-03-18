'use strict';

var gulp = require('gulp');
var rsync = require('gulp-rsync');
var GulpSSH = require('gulp-ssh');

var rename = require('gulp-rename');
var plug = require('gulp-load-plugins')();
var env = plug.util.env;
var log = plug.util.log;

var paths = require('../gulp.config.json');
var servers = require('./servers.json');
var runSequence = require('run-sequence');

var lazypipe = require('lazypipe');
var prompt = require('gulp-prompt');
var contains = require('gulp-contains');
var gutil = require('gulp-util');

// Data from prompt
var idServer, password, stream;

gulp.task('deploy:copy_config', function() {

    return gulp
        .src(servers[idServer].config)
        .pipe(rename('config.js'))
        .pipe(gulp.dest(paths.build));

});

gulp.task('deploy:archive', ['deploy:push'], function() {

    return stream.exec(
        'cd ' + servers[idServer].path + ';' +
        '[ -d ./latest ] && (date "+%Y-%m-%d-%H:%M:%S" | xargs mv latest);' +
        'mv tmp latest;' +
        'ls -tr | head -n -10 | xargs rm -Rf;'
    );

});

gulp.task('deploy:push', function() {

    return gulp.src('build/**/*')
        .pipe(stream.dest(servers[idServer].path + '/tmp'));

});

// Run document applicaton on server.
gulp.task('deploy', function(callback) {

    return gulp
        .src('build/**/*')
        .pipe(prompt.prompt([{
            type: 'list',
            name: 'id',
            message: 'Which server do you want to deploy on?',
            choices: Object.keys(servers)
        }, {
            type: 'password',
            name: 'pass',
            message: 'Server password'
        }], function(res) {
            idServer = res.id;
            password = res.pass;

            stream = new GulpSSH({
                ignoreErrors: false,
                sshConfig: {
                    host: servers[idServer].url,
                    port: 22,
                    username: servers[idServer].user,
                    password: password
                }
            });

            runSequence(
                'deploy:copy_config',
                'deploy:archive'
            );
        }));
});

// Run document applicaton on server.
// gulp deploy:noprompt --server="dev" --key="plaintextpw"
gulp.task('deploy:noprompt', function(callback) {

    if (env.server) {
        idServer = env.server;
    } else {
        log(plug.util.colors.red('You did not specify a server!'));
        log('Use $ gulp deploy:noprompt --server="dev"');
        log('Available servers:');
        log('\n' + JSON.stringify(servers, null, 2));
        return;
    }

    var fs = require('fs');
    stream = new GulpSSH({
        ignoreErrors: false,
        sshConfig: {
            host: servers[idServer].url,
            port: 22,
            username: servers[idServer].user,
            privateKey: fs.readFileSync('/var/lib/jenkins/.ssh/id_rsa')
        }
    });

    return runSequence(
        'deploy:copy_config',
        'deploy:archive', 
        callback
    );

});

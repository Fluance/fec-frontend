/*
 * Import gulp dependencies
 */

var plug = require('gulp-load-plugins')();
var gulp = require('gulp');
var paths = require('../gulp.config.json');
var log = plug.util.log;
var concat = require('gulp-concat');
var print = require('gulp-print'); // jshint ignore:line
var cleanCSS = require('gulp-clean-css');
var args = require('yargs').argv;
var runSequence = require('run-sequence');
var del = require('del');
var rename = require('gulp-rename');
var vinylPaths = require('vinyl-paths');


var target,
    buildDependencies = [];

/**
 * Build a new version of the app, is published in the folder 'build'
 * As version number the running application version is injected
 * @return {Stream}
 */
gulp.task('build2', function(callback) {

    // Add more steps (tasks) to the build Process by adding in the List
    return runSequence(
        'build:clean',
        'build2:loadBuildEnvironment',
        // Next steps get executed in parallel due to the array notation
        [
            'build:sass',
            'build:config',
            'build:copy_lang',
            'build:injectversion:build',
            'build:copy_fonts',
            'build:copy_images'
        ],
        'build2:wiredep', // Affected by target
        'build2:templatecache', // Affected by target
        'build2:build', // Affected by target
        'build2:finish',
        callback
    );
});

/**
 * Finish the build and notify the operating system
 * @return {Stream}
 */
gulp.task('build2:finish', function() {
    log('Building the optimized app');

    // clean out the temp folder when done
    del(paths.temp);

    // rename via string 
    return gulp.src(paths.build + target.index)
        .pipe(vinylPaths(del))
        .pipe(rename('index.html'))
        .pipe(print(function(file) {
            log(plug.util.colors.green('Renaming ' + file));
            return;
        }))
        .pipe(gulp.dest(paths.build))
        .pipe(plug.notify({
            onLast: true,
            message: 'Build finished!'
        }));
});

/**
 * Copy fonts to build directory
 * @return {Stream}
 */
gulp.task('build2:loadBuildEnvironment', function() {
    log('*** *** *** *** *** *** *** *** *** *** *** *** *** *** ***');

    // Load targets and find target
    var availableTargets = paths.targets,
        argTarget = args.target,
        depList = [],
        writeableArgTarget = argTarget; // Local array just for a nice console print

    // Check if the given target exists
    var valid = false;
    for (var property in availableTargets) {
        if (availableTargets.hasOwnProperty(property)) {
            if (availableTargets[property].name === writeableArgTarget) {
                valid = true;
            }
        }
    }

    // If target does not exist or no target has been specified
    if (undefined === writeableArgTarget || !valid) {
        log(plug.util.colors.red('The given target [' + writeableArgTarget + '] does not exist, using [' + availableTargets.fluance.name + '].')); // jshint ignore:line
        writeableArgTarget = 'fluance';
    }

    // Set the build target
    for (property in availableTargets) {
        if (availableTargets.hasOwnProperty(property)) {
            if (availableTargets[property].name === writeableArgTarget) {
                // Found target matching the name
                target = availableTargets[property];
                if (availableTargets[property].requires) {
                    // Target has dependencies
                    log(plug.util.colors.blue('Found dependency: ' + availableTargets[property].requires));
                    var requiresString = availableTargets[property].requires;
                    // Add depedency to dependency list
                    if (availableTargets.hasOwnProperty(requiresString)) {
                        buildDependencies.push(availableTargets[requiresString]);
                        depList.push(availableTargets[requiresString].name);
                    } else {
                        // Error if the given dependency does not exist
                        log(plug.util.colors.red('FATAL: The listed dependency [' + requiresString + '] does not exist.')); // jshint ignore:line
                    }
                }
            }
        }
    }

    log('Starting build for target: ' + plug.util.colors.bgGreen(target.name + ' at ' + target.index));
    // Add the target itself as dependency of itself
    // It's simpler to only work with dependencies at some points (e.g. templatecache)
    buildDependencies.push(target);
    depList.push(target.name);
    log(plug.util.colors.bgBlue('Dependecy list: ' + depList));
    log('*** *** *** *** *** *** *** *** *** *** *** *** *** *** ***');
    return;
});

/**
 * Inject all the files into the new index.html
 * revision, but no map
 * @return {Stream}
 */
gulp.task('build2:build', function() {
    log('Rev\'ing files and building ' + target.index);

    return gulp
        .src(paths.client + target.index)
        .pipe(plug.inject(gulp.src([paths.temp + 'templates_*.js'], {
            read: false
        }), {
                starttag: '<!-- inject:templates:js -->',
                ignorePath: '/.temp'
            }))
        .pipe(plug.usemin({
            assetsDir: './',
            html: [plug.minifyHtml({
                empty: true
            })],
            css: [
                plug.autoprefixer('last 2 version', '> 5%'),
                cleanCSS({ processImport: false }),
                'concat',
                plug.rev()
            ],
            css_libs: [
                cleanCSS({ processImport: false }),
                'concat',
                plug.rev()
            ],
            js: [
                plug.ngAnnotate({
                    add: true
                }),
                plug.uglify({
                    mangle: false
                }),
                plug.rev()
            ],
            js_libs: [plug.uglify({
                mangle: false
            }), plug.rev()]
        }))
        .pipe(gulp.dest(paths.build));
});

/**
 * Create the angular $templateCache from the html templates
 * Creates one unified javascript file, containing all html templates, keeping them ready for angular to use
 * @return {Stream}
 */
gulp.task('build2:templatecache', function() {
    log(plug.util.colors.green('Creating the AngularJS $templateCaches'));

    var merge = require('merge-stream')(); // () needed to actually create a stream

    for (var i = buildDependencies.length - 1; i >= 0; i--) {
        log(plug.util.colors.gray('Adding [' + buildDependencies[i].name + '] to the template merge stream.'));
        merge.add(
            gulp
                .src(buildDependencies[i].htmlTemplates)
                //.pipe(plug.bytediff.start())
                .pipe(plug.minifyHtml({
                    empty: true
                }))
                //.pipe(plug.bytediff.stop(bytediffFormatter))
                .pipe(plug.angularTemplatecache('templates_' + buildDependencies[i].name + '.js', {
                    module: 'app.core',
                    standalone: false,
                    root: buildDependencies[i].templateRoot
                }))
                .pipe(gulp.dest(paths.temp))
        );
    }
    return merge.isEmpty() ? null : merge;
});

/**
 * Wire the bower dependencies into index.html
 * @return {Stream}
 */
gulp.task('build2:wiredep', function() {
    log(plug.util.colors.green('Wiring the bower dependencies into ' + target.index));
    var wiredep = require('wiredep').stream;
    return gulp.src(paths.client + target.index)
        .pipe(wiredep({
            directory: './bower_components/',
            bowerJson: require('../bower.json'),
            exclude: target.exclusions, // NOTE: We must also exclude exclusions from dependecies...
            ignorePath: '../..' // bower files will be relative to the root
        }))
        .pipe(gulp.dest(paths.client))
        .pipe(print(function() {
            log(plug.util.colors.green('Finished wiring the bower dependencies into ' + target.index));
            return;
        }));
});

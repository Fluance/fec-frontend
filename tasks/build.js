/*
 * Import gulp dependencies
 */

const gulp = require('gulp');
const gutil = require('gulp-util');
const git = require('gulp-git');
const pkg = require('../package.json');
const vrsn = require('../version.json');
const plug = require('gulp-load-plugins')();
const paths = require('../gulp.config.json');
const log = plug.util.log;
const del = require('del');
const htmlreplace = require('gulp-html-replace');
const args = require('yargs').argv;

const webpack = require('webpack');
const webpackDevConfig = require("../webpack.dev");
const webpackProdConfig = require('../webpack.prod');

// gulp arguments
const PRODUCTION_MODE = args.production;
const QUIET_MODE = args.quiet;

const webpackConfig = PRODUCTION_MODE ? webpackProdConfig : webpackDevConfig;


/**
 * Remove all files from the build folder
 * One way to run clean before all tasks is to run
 * from the cmd line: gulp clean && gulp build
 * @return {Stream}
 */
function clean(cb) {
    let delPaths = [].concat(paths.build, paths.temp, paths.report, paths['test_results']);
    log('Cleaning: ' + plug.util.colors.blue(delPaths));
    return del(delPaths, cb);
}

/**
 * Copy the all unbundled files (language, lazy loaded services) to the build directory
 * @return {Stream}
 */
function copy_unbundled() {
    return gulp.src(paths.unbundled)
    //.pipe(jsonMinify())
        .pipe(gulp.dest(paths.build + '/app'));
}

function watch_copy_unbundled() {
    //gulp.watch(paths.unbundled, gulp.series(copy_unbundled));
    //return;

    const watcher = gulp.watch(paths.unbundled);
    watcher.on('change', (paths, stats) => {
        copy_unbundled();
    })
}

/**
 * Copy the config file to the build directory
 * @return {Stream}
 */
function copy_config() {
    return gulp.src(paths.configfile)
        .pipe(gulp.dest(paths.build));
}


/**
 * Finish the build: cleanup and notify the operating system
 * @return {Stream}
 */
function cleanup_and_notify() {
    log('___________________________________________________________________ Building optimized app');

    // clean out the temp folder when done
    del(paths.temp);

    if (QUIET_MODE) { return Promise.resolve('Deployed code!'); }

    return gulp.src('./').pipe(plug.notify({
        onLast: true,
        message: 'Deployed code!'
    }));
}

/**
 * Copy fonts to build directory
 * @return {Stream}
 */
function copy_fonts() {
    let dest = paths.build + 'fonts';
    log('Copying fonts');
    return gulp
        .src(paths.fonts)
        .pipe(gulp.dest(dest));
}

/**
 * Compress images and copy them to build directory
 * @return {Stream}
 */
function copy_static_images() {
    let dest = paths.build + 'content/images';
    log('Compressing, caching, and copying images');
    return gulp
        .src(paths.images)
        .pipe(plug.imagemin({
            optimizationLevel: 3
        }))
        .pipe(gulp.dest(dest));
}

/**
 * Copy static pages (eg: loading) to build directory
 * @return {Stream}
 */
function copy_static_html() {
    let dest = paths.build + 'content';
    log('Copying static pages');
    return gulp
        .src(paths.static_pages)
        .pipe(gulp.dest(dest));
}

/**
 * Include and set PDF viewer page dependencies
 */
function copy_dependencies_pdf_viewer() {
    return gulp
        .src(paths.viewers.pdfViewerFiles, {base: 'node_modules/'})
        .pipe(gulp.dest(paths.build + 'viewers/libs/'));
}

/**
 * Inject all the files into pdf-viewer.html
 * @return {Stream}
 */
function inject_dependencies_pdf_viewer() {
    let buildViewersPath = '/viewers/';
    let libsPath = 'libs/'; // relative path

    let sources = paths.viewers.pdfViewerInjections;
    let cssSources = sources.css.map(function(source) { return libsPath + source});
    let jsSources = sources.js.map(function(source) { return libsPath + source});

    return gulp
        .src(paths.viewers.base + '/pdf-viewer.html')
        .pipe(htmlreplace({
            css_libs_pdf_viewer: cssSources,
            js_libs_pdf_viewer: jsSources
        }))
        .pipe(gulp.dest(paths.build + buildViewersPath));
}

/**
 * Run webpack and create bundle(s)
 * @param callback callback to continue gulp processing
 *
 * see: https://github.com/webpack/docs/wiki/usage-with-gulp
 */
function webpack_build(callback) {
    log('____________________________________________________ Rev\'ing files and building index.html');

    // run webpack (build dependency tree):
    // - build bundles (css, js)
    // - inject bundles in index.html
    // - copy (module loader 'outputPath') resources (eg: fonts, svg, ...)
    webpack(webpackConfig,
        function(err, stats) {
            try {
                if (err) {
                    console.log('ERROR')
                    throw new gutil.PluginError("webpack", err);
                }
                else {
                    console.log('DONE')

                    gutil.log("[webpack]", stats.toString({
                        // output options
                    }));
                }
            }
            catch(exception) {
                console.log('exception: ', exception);

            }
            finally {
                // callback (continue gulp processing)
                callback();
            }
        });
}


/**
 * Generate version.js file for continuous build
 * Version number is the last commit hash
 * @return {Stream}
 */
function generateVersion_build(cb) {
    git.exec({
        args: 'rev-parse --short HEAD'
    }, function(err, stdout) {
        if (err) {
            throw err;
        }
        let hash = stdout.replace(/(\r\n|\n|\r)/gm, '');
        generateVersionJs('build+sha.' + hash, cb);
    });
}


///////////////////////////////////////////////// HELPER FUNCTIONS /////////////////////////////////////////////////

/**
 * Generate version.js file
 * @param  {String} codeName String to add to the version number as identifier
 * @return {function()}      callback Function to call after finishing the task
 */
function generateVersionJs(codeName, callback) {
    let templateArray = [];
    let jsonTemplateArray = [];

    let version = '',
        major = 0,
        minor = 0,
        dot = 0;

    let oldVersion = {};



    if (vrsn && vrsn.versions[0]) {
        oldVersion = {
            version: vrsn.versions[0].full,
            major: vrsn.versions[0].major,
            minor: vrsn.versions[0].minor,
            dot: vrsn.versions[0].dot,
            codeName: vrsn.versions[0].codeName
        };
    }

    // Will looks like X.Y.Z
    let arrayVersionSplitDot = pkg.version.split('-')[0].split('.');

    major = arrayVersionSplitDot[0];
    minor = arrayVersionSplitDot[1];
    dot = arrayVersionSplitDot[2];

    version = major + '.' + minor + '.' + dot;

    if (codeName) {
        version = version + '-' + codeName;
    }

    templateArray = ['/** GENERATED BY GULP INJECT-VERSION */',
        'let VERSION  = {',
        '\'full\'    : \'' + version + '\',',
        '\'major\'   : ' + major + ',',
        '\'minor\'   : ' + minor + ',',
        '\'dot\'     : ' + dot + ',',
        '\'codeName\': \'' + codeName + '\'',
        '};'
    ];

    templateArray.push('let ALLVERSIONS  = [');
    jsonTemplateArray.push('{');
    jsonTemplateArray.push('"versions": [');
    if (vrsn) {
        if (parseInt(oldVersion.major) !== parseInt(major) || parseInt(oldVersion.minor) !== parseInt(minor) || parseInt(oldVersion.dot) !== parseInt(dot)) { // jshint ignore:line
            templateArray.push(
                '{',
                '\'full\'    : \'' + version + '\',',
                '\'major\'   : ' + major + ',',
                '\'minor\'   : ' + minor + ',',
                '\'dot\'     : ' + dot + ',',
                '\'codeName\': \'' + codeName + '\'',
                '},'
            );
            jsonTemplateArray.push(
                '{',
                '\"full\"    : \"' + version + '\",',
                '\"major\"   : ' + major + ',',
                '\"minor\"   : ' + minor + ',',
                '\"dot\"     : ' + dot + ',',
                '\"codeName\": \"' + codeName + '\"',
                '},'
            );
        }
        let closeBracket;
        for (let i = 0; i < vrsn.versions.length; i++) {
            closeBracket = '}';
            if (i + 1 !== vrsn.versions.length) {
                closeBracket = '},';
            }
            templateArray.push(
                '{',
                '\'full\'    : \'' + vrsn.versions[i].full + '\',',
                '\'major\'   : ' + vrsn.versions[i].major + ',',
                '\'minor\'   : ' + vrsn.versions[i].minor + ',',
                '\'dot\'     : ' + vrsn.versions[i].dot + ',',
                '\'codeName\': \'' + vrsn.versions[i].codeName + '\'',
                closeBracket
            );
            jsonTemplateArray.push(
                '{',
                '\"full\"    : \"' + vrsn.versions[i].full + '\",',
                '\"major\"   : ' + vrsn.versions[i].major + ',',
                '\"minor\"   : ' + vrsn.versions[i].minor + ',',
                '\"dot\"     : ' + vrsn.versions[i].dot + ',',
                '\"codeName\": \"' + vrsn.versions[i].codeName + '\"',
                closeBracket
            );
        }
    } else {
        templateArray.push(
            '{',
            '\'full\'    : \'' + version + '\',',
            '\'major\'   : ' + major + ',',
            '\'minor\'   : ' + minor + ',',
            '\'dot\'     : ' + dot + ',',
            '\'codeName\': \'' + codeName + '\'',
            '}'
        );
        jsonTemplateArray.push(
            '{',
            '\"full\"    : \"' + version + '\",',
            '\"major\"   : ' + major + ',',
            '\"minor\"   : ' + minor + ',',
            '\"dot\"     : ' + dot + ',',
            '\"codeName\": \"' + codeName + '\"',
            '}'
        );
    }
    templateArray.push('];');
    jsonTemplateArray.push(']');
    jsonTemplateArray.push('}');

    let template = templateArray.join('\n');
    let jsonTemplate = jsonTemplateArray.join('\n');

    // NEW: add ES6 export
    template = template.concat('\nexport { VERSION, ALLVERSIONS }\n');

    let src = require('stream').Readable({
        objectMode: true
    });
    src._read = function() {
        this.push(new gutil.File({
            cwd: '',
            base: '',
            path: 'version.js',
            contents: new Buffer(template)
        }));
        this.push(null);
    };
    src.pipe(gulp.dest('src/client/app/'));

    let jsonSrc = require('stream').Readable({
        objectMode: true
    });
    jsonSrc._read = function() {
        this.push(new gutil.File({
            cwd: '',
            base: '',
            path: 'version.json',
            contents: new Buffer(jsonTemplate)
        }));
        this.push(null);
    };
    jsonSrc.pipe(gulp.dest('.'));
    callback();
}

///////////////////////////////////////////////// HELPER FUNCTIONS /////////////////////////////////////////////////


// -----------------------------------------------------------------------------------------------------------------
// Define complex tasks to export
// -----------------------------------------------------------------------------------------------------------------

// copy all the files not handled by Webpack
const copyAllStaticFiles = gulp.series(
    //copy_fonts,
    //copy_unbundled, -- handled by Webpack
    //copy_config, -- handled by Webpack
    copy_static_images,
    inject_dependencies_pdf_viewer,
    copy_dependencies_pdf_viewer,
    copy_static_html
);

// common build tasks (eg: for Webpack, for Webpack dev server)
const buildCommon = gulp.series(
    generateVersion_build,
    clean,
    //copy_unbundled, -- handled by Webpack
    //copy_config, -- handled by Webpack
    copyAllStaticFiles,
);

const buildAll = gulp.series(
    buildCommon,
    webpack_build,
    cleanup_and_notify
);


// export tasks
exports.buildCommon = buildCommon;
exports.webpack = webpack_build;
exports.cleanupAndNotify = cleanup_and_notify;

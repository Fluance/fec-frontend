// Karma configuration
module.exports = function(config) {
    var wiredep = require('wiredep');
    var bowerFiles = wiredep({
        directory: './bower_components/',
        bowerJson: require('../bower.json'),
        exclude: [
            'bower_components/bootstrap/',
            'bower_components/angular-bootstrap/',
            'bower_components/google-code-prettify',
            'bower_components/Sortable/knockout-sortable.js',
            'bower_components/Sortable/react-sortable-mixin.js',
            'bower_components/Materialize/bin/materialize.css'
        ],
        ignorePath: '../..' // bower files will be relative to the root
    })['js'];

    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '../',

        // frameworks to use
        // some available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine', 'mocha', 'chai', 'sinon', 'chai-sinon'],

        // list of files / patterns to load in the browser

        files: bowerFiles.concat([
            './node_modules/harmony-collections/harmony-collections.min.js',
            './test/test-helpers/bind-polyfill.js',
            './test/test-helpers/spec-helper.js',
            './test/test-helpers/mock-data.js',
            './test/test-helpers/stubs.js',
            './src/client/config.js',
            './src/client/app/app.module.js',
            './src/client/app/**/*.module.js',
            './src/client/app/**/!(*.spec).js',
            './src/client/lang.js',
            // Select all test
            './test/src/**/*.js',
            './src/client/app/**/*.spec.js'
        ]),

        // list of files to exclude
        exclude: [],

        proxies: {
            '/': 'http://localhost:8888/'
        },

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            '{src/client/app,src/client/app/**/!(*.spec).js}': 'coverage'
        },

        // test results reporter to use
        // possible values: 'dots', 'progress', 'coverage'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress', 'coverage', 'html'],

        // the default configuration
        htmlReporter: {
            outputDir: 'test_results/karma',
            templatePath: 'node_modules/karma-html-reporter/jasmine_template.html'
        },

        coverageReporter: {
            type: 'lcov',
            dir: 'test_results/coverage/'
        },

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR ||
        // config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        // browsers: ['Chrome', 'ChromeCanary', 'FirefoxAurora', 'Safari', 'PhantomJS'],
        browsers: ['PhantomJS'],

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false
    });
};

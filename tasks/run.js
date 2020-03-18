/*
 * Import gulp dependencies
 */

const gutil = require('gulp-util');
const webpack = require('webpack');
const args = require('yargs').argv;
const open = require('open');
const gulpopen = require('gulp-open');

const webpackDevConfig = require("../webpack.dev");
const webpackProdConfig = require('../webpack.prod');
const WebpackDevServer = require('webpack-dev-server');

// gulp arguments
const PRODUCTION_MODE = args.production;

const webpackConfig = PRODUCTION_MODE ? webpackProdConfig : webpackDevConfig;
PRODUCTION_MODE ? gutil.log('==> PROD MODE') : gutil.log('==> DEV MODE');

/**
 * Run Webpack dev server to serve the application and watch changes for live reload
 * see: https://github.com/webpack/docs/wiki/usage-with-gulp
 */
// live reload working!
function webpackDevServerTask() {
    // Start a webpack-dev-server
    let compiler = webpack(webpackConfig);

    let wds = new WebpackDevServer(compiler, {
        // server and middleware options
        contentBase: "./dist",
        open: 'Chrome',
        stats: {
            colors: true
        }
    });

    wds.listen(8080, "0.0.0.0", function(err, stat) {
        if(err) {
            throw new gutil.PluginError("webpack-dev-server", err);
        }
        else {
            // Server listening
            gutil.log("[webpack-dev-server]", "http://localhost:8080/webpack-dev-server/index.html........................");
        }
    });

    // TODO: webpack dev server not opening window....why?
    // workaround: use a node package to open browser
    //open('http://localhost:8080/', {app: ['google chrome']});
    open('http://localhost:8080/');
}


// export tasks
exports.devServer = webpackDevServerTask;

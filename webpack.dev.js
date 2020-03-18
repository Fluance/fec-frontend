const merge = require('webpack-merge');
const path = require('path');
const common = require('./webpack.common');

const DEV_SERVER_LIVE_RELOAD = ['webpack-dev-server/client/index.js?http://localhost:8080/'];

/*
  NOTES:
  1. need to add 'webpack-dev-server/client/index.js?http://localhost:8080/' in "entry" so that webpack-dev-server correctly watches changes in files included in "app" bundle
*/

var exportObject = merge(common, {
    mode: "development",
    entry: {
      app: [ 'webpack-dev-server/client/index.js?http://localhost:8080/', './src/client/app/app.entry.js'],
    },
    devServer: {
        contentBase: ". /dist",
        //outputPath: path.join(__dirname, 'dist'),
        //host: "0.0.0.0", // --host 0.0.0.0
        //public: '0.0.0.0',
        //useLocalIp: true,
        //disableHostCheck: true,
        port: 8080
    },
    devtool: 'source-map',
    plugins: [
    ]
});

// "merge()" doesn't like array of strings... do it after.
//exportObject.entry.app = DEV_SERVER_LIVE_RELOAD.concat(common.entry.app);

module.exports = exportObject;

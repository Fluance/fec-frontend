const merge = require('webpack-merge');
const common = require('./webpack.common');

module.exports = merge(common, {
    mode: "production",
    entry: {
        app: ['./src/client/app/app.entry.js'],
    },
});

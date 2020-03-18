var webpack = require('webpack');
var path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require('copy-webpack-plugin');
const paths = require('./gulp.config.json');

const paths_static = [...paths.unbundled, paths.configfile];

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const DuplicatePackageCheckerPlugin = require("duplicate-package-checker-webpack-plugin");

/*
  NOTES:
*/
module.exports = {
    //watch: true,
    module: {
        //noParse: [/handsontable.js/, /numbro.js/],
        //
        // ISSUE: ng-handsontable project is has dependency,
        //           'handsontable': '^0.28.0'
        // this very early version of Handsontable doesn't work well with Webpack ("require is not a function")
        //
        // SOLUTION 1: (clone project + ?, use npm to override nested dependency?) update dependency to latest Handsontable CE version = 6.2.2
        //
        // SOLUTION 2: do workaround using Wepback (noParse + alias bellow), and add to project dependency to latest Handsontable CE version = 6.2.2
        // REF: https://github.com/handsontable/handsontable/issues/3718
        //
        // Step 1 for SOLUTION 2
        // pervent Webpack from parsing/ignore the version of Handsontable in ngHandsontable dependencies (eg: 0.28.0)
        noParse: [path.join(__dirname, 'node_modules/ng-handsontable/node_modules/handsontable/dist/handsontable.js')],
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                //use: ["ng-annotate-loader", "babel-loader"]
                use: {
                    loader: 'babel-loader',
                    options: {
                      presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.html$/,
                exclude: [
                    path.resolve(__dirname, 'src/client/index-webpack.html')
                ],
                use: ["ngtemplate-loader", "html-loader"]
                //use: ["raw-loader"]
            },
            {
                test: /\.css$/,
                use: ['style-loader', MiniCssExtractPlugin.loader, 'css-loader']
            },
            {
                test: /\.scss$/,
                use: ['style-loader', MiniCssExtractPlugin.loader, 'css-loader?sourceMap', 'sass-loader?sourceMap']
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            publicPath: 'content/images', // path (in url) in (output) js/css file; (default = outputPath)
                            outputPath: '../dist/content/images' // where to save the files
                        }
                    }
                ]
            },
            {
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: 'fonts/'
                    }
                }]
            },
            // issue with ui-sortable and webpack (element.sortable is not a function)
            // REF: https://github.com/angular-ui/ui-sortable/issues/518
            {
                test: /ui-sortable/,
                use: ['imports-loader?$UI=jquery-ui/ui/widgets/sortable']
            }
        ]
    },
    resolve: {
        // Step 2 for SOLUTION 2
        // use the version of Handsontable defined in project dependencies (eg: 6.2.2)
        alias: {
            'handsontable/dist/handsontable': path.join(__dirname, 'node_modules/handsontable/dist/handsontable.js')
        },
        extensions: ["*", ".js", ".jsx"]
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "[name].bundle-[hash].js"
    },
    // create "vendors" bundle (vendors-app.bundle) from node_module dependencies in "app"
    // note: using imports in "vendors.entry.js" in "app"
    optimization: {
        splitChunks: {
            chunks: 'all'
        }
    },
    plugins: [
        // clean-up 'dist' folder
        //new CleanWebpackPlugin(['./dist']),
        // inject bundle(s) into index.html
        new HtmlWebpackPlugin({
            template: "./src/client/index-webpack.html",
            filename: "index.html"
        }),
        new MiniCssExtractPlugin({
            filename: `[name].bundle-[hash].css`
        }),
        // Automatically load modules instead of having to import or require them everywhere.
        // - Shimming -
        // eg: makes package 'handsontable/dist/handsontable' available (everywhere) through 'Handsontable' variable
        // (expected as a global variable and used by ngHandsontable.js)
        new webpack.ProvidePlugin({
            // variable: package/module
            //
            'window.$': 'jquery',
            // "the mysterious case of webpack angular and jquery"
            // ref: https://stackoverflow.com/questions/36065931/webpack-how-to-make-angular-auto-detect-jquery-and-use-it-as-angular-element-in
            'window.jQuery': 'jquery', // eg: used in angular.js
            '$': 'jquery',
            'jQuery': 'jquery',
            'Handsontable': 'handsontable/dist/handsontable',
            FastClick: 'fastclick',
            _: 'lodash',
            'Chart': 'chart.js'
            //moment: 'moment'
        }),
        // Copy some static files. Transform target path (in gulp.config.json => target file path in /dist)
        // eg: remove 'src/client' from target path
        new CopyPlugin(
            paths_static.map((path) => {
                return {from: path, transformPath: (targetPath, absolutePath) => {
                    console.log('targetPath:', targetPath)
                    if(targetPath.startsWith("src/client")) {
                        return targetPath.substring('src/client/'.length)
                    }
                    // quick fix for Windows (it uses backslash '\' in path)
                    else if(targetPath.startsWith("src")) {
                        return targetPath.substring(11);
                    }
                    else {
                        return targetPath;
                    }
                }}
            })
        ,
        {logLevel: 'silent'}),
        //new BundleAnalyzerPlugin(),
        //new DuplicatePackageCheckerPlugin()
    ],
    externals: {
        Handsontable: 'handsontable/dist/handsontable',
        ngHandsontable: 'ng-handsontable/dist/ngHandsontable.js'
    }
};

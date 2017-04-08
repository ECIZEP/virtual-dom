var path = require('path');
var htmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        main: './src/js/diff.js'
    },
    output: {
        path: path.resolve(__dirname, './dist'),
        filename: 'js/[name].js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                include: path.resolve(__dirname, './src/js'),
                exclude: path.resolve(__dirname,'./node_modules'),
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env','stage-2']
                    }
                }
            }
        ]
    }/*,
    plugins: [
        new htmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.html',
            inject: 'head',
            minify: {
                removeComments: true
            }
        }),
    ]*/

}
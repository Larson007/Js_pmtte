const path = require('path');
const MinifyPlugin = require("babel-minify-webpack-plugin");

module.exports = {
    entry: './src/js/script.js',
    mode: 'production',
    output: {
        filename: 'script.min.js',
        path: path.resolve(__dirname, 'dist/js')
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            [
                                "@babel/env",
                                {
                                    "targets": {
                                        "browsers": [
                                            "last 2 versions",
                                            "safari >= 7"
                                        ]
                                    }
                                }
                            ]
                        ]
                    }
                }
            }
        ]
    },
    plugins: [
        new MinifyPlugin()
    ]
};
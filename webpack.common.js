const
    path = require('path'),
    fs = require('fs'),
    webpack = require('webpack'),
    ProgressBarPlugin = require('progress-bar-webpack-plugin'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    HtmlWebpackPugPlugin = require('html-webpack-pug-plugin'),
    VueLoaderPlugin = require('vue-loader/lib/plugin'),
    MiniCssExtractPlugin = require('mini-css-extract-plugin'),
    TerserPlugin = require("terser-webpack-plugin"),
    CopyWebpackPlugin = require('copy-webpack-plugin'),
    pagesDir = path.join(__dirname, './src/pages'),
    pages = fs.readdirSync(pagesDir).filter(fileName => fileName.endsWith('.pug'));

module.exports = {
    entry: {
        main: [
            './src/js/main.js',
            './src/styles/main.scss'
        ],
    },

    optimization: {
        removeEmptyChunks: true,
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all',
                },
            },
        },
        minimize: true,
        minimizer: [
            new TerserPlugin({
                extractComments: false,
            }),
        ],
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader',
                options: {
                    loaders: {
                        js: 'babel-loader',
                    },
                },
            },
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {sourceMap: true}
                    }, {
                        loader: 'postcss-loader',
                        options: {sourceMap: true, config: {path: `./postcss.config.js`}}
                    }, {
                        loader: 'sass-loader',
                        options: {sourceMap: true}
                    }
                ]
            },
            {
                test: /\.styl$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: {sourceMap: true}
                    }, {
                        loader: 'postcss-loader',
                        options: {sourceMap: true, config: {path: `./postcss.config.js`}}
                    },
                ]
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/,
                use: {
                    loader: 'url-loader',
                    options: {
                        limit: 8000,
                        name(url) {
                            return path
                                .relative(path.resolve(__dirname, 'src'), url)
                                .replace(/[\\\/]+/g, '/');
                        },
                        publicPath: '..',
                    },
                },
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name(url) {
                                  return path
                                      .relative(path.resolve(__dirname, 'src'), url)
                                      .replace(/[\\\/]+/g, '/');
                            },
                            publicPath: '..',
                        },
                    },
                ],
            },

            {
                test: /\.pug$/,
                oneOf: [
                    {
                        resourceQuery: /^\?vue/,
                        use: 'pug-plain-loader'
                    },
                    { loader: 'pug-loader' }
                ]


            },
        ],
    },

    resolve: {
        alias: {
            'vue$': 'vue/dist/vue.esm.js',
            Components: path.resolve(__dirname, './src/components/'),
            '$': 'jquery',
            'jQuery': 'jquery',
            'window.jQuery': 'jquery',
        },
        extensions: ['.vue', '.js', '.json'],
    },

    plugins: [
        new ProgressBarPlugin(),

        new MiniCssExtractPlugin({filename: 'css/[name].min.css'}),
        new webpack.ProvidePlugin({
            '$': 'jquery',
            'jQuery': 'jquery',
            'window.jQuery': 'jquery',
        }),
        new webpack.HotModuleReplacementPlugin({}),
        new HtmlWebpackPugPlugin(),
        new VueLoaderPlugin(),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, './src/images'),
                    to: 'images',
                }, {
                    from: path.resolve(__dirname, './src/fonts'),
                    to: 'fonts',
                },
            ],
        }),
    ],
}

module.exports.plugins.push(...[
    ...pages.map( page => new HtmlWebpackPlugin({
        template: `${pagesDir}/${page}`,
        filename: `./${page.replace(/\.pug/, '.html')}`,
        chunks: [ page.replace(/\.pug/, ''), 'main' ],
        inject: 'body',
        minify: false
    }))
]);

module.exports.entry = Object.assign(module.exports.entry, ...pages.map( page => {
    const
        key = page.replace(/\.pug/, ''),
        item = {},
        js = fs.existsSync(`./src/js/pages/${key}.js`) ? `./src/js/pages/${key}.js` : null,
        scss = fs.existsSync(`./src/styles/pages/${key}.scss`) ? `./src/styles/pages/${key}.scss` : null;
    item[key] = [];
    if (js) item[key].push(js);
    if (scss) item[key].push(scss);
    return item;
}))

console.log('Auto generated chunks: ', module.exports.entry)
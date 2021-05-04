const
    path = require('path'),
    fs = require('fs'),
    ProgressBarPlugin = require('progress-bar-webpack-plugin'),
    CopyWebpackPlugin = require('copy-webpack-plugin'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    HtmlWebpackPugPlugin = require('html-webpack-pug-plugin'),
    VueLoaderPlugin = require('vue-loader/lib/plugin'),
    webpack = require('webpack'),
    MiniCssExtractPlugin = require('mini-css-extract-plugin'),
    RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts'),
    TerserPlugin = require("terser-webpack-plugin");

module.exports = env => {
    /* присваиваем зависимость dev в зависимости от запущенной клманды. Проставляется в package.json scripts --env  */
    const
        devMode = env === 'dev' ? env : false,
        projectPublicPath = './',
        prodMode = env === 'production' ? env : false,
        buildPath = prodMode ? projectPublicPath : './build',
        PAGES_DIR = './src/pages/',
        PAGES = fs.readdirSync(PAGES_DIR).filter(fileName => fileName.endsWith('.pug')),

        config = {
            output: {
                filename: 'js/[name].min.js',
                // Путь куда компилируются файлы
                path: path.resolve(__dirname, buildPath),
                publicPath: '/',
            },
            // Отвечает за sourceMaps
            devtool: devMode ? 'source-map' : false,

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
            // Настройки devServer
            devServer: {
                // При запуске открывает сразу в браузере
                open: true,
                // Показывает ошибки в окне браузера
                overlay: true,
            },

            module: {
                // правила обработки файлов
                rules: [
                    {
                        test: /\.js$/,
                        loader: 'babel-loader',
                    },
                    // отвечает за файлы vue
                    {
                        test: /\.vue$/,
                        loader: 'vue-loader',
                        options: {
                            loaders: {
                                js: 'babel-loader',
                            },
                        },
                    },
                    /* отвечает за файлы css,scss
                    *  лоадеры подключаются с конца
                    *  sass-loader    - обработка scss
                    *  postcss-loader - делает обработку css в соответсвии с параметрами задаными в файле postcss.config.js
                    *  sass-loader    - компилирует css
                    *
                    *  (?sourceMap делает подключает sourceMap в соответсвии со значением с devtool) */
                    {
                        test: /\.scss$/,
                        use: [
                            'style-loader',
                            MiniCssExtractPlugin.loader,
                            {
                                loader: 'css-loader',
                                options: { sourceMap: true }
                            }, {
                                loader: 'postcss-loader',
                                options: { sourceMap: true, config: { path: `./postcss.config.js` } }
                            }, {
                                loader: 'sass-loader',
                                options: { sourceMap: true }
                            }
                        ]
                    },
                    // отвечает за файлы styl
                    {
                        test: /\.styl$/,
                        use: [
                            'stylus-loader',
                            devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
                            {
                                loader: 'css-loader',
                                options: { sourceMap: true }
                            }, {
                                loader: 'postcss-loader',
                                options: { sourceMap: true, config: { path: `./postcss.config.js` } }
                            },
                        ]
                        // loader: [
                        //     devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
                        //     'css-loader',
                        //     'postcss-loader',
                        //     'stylus-loader',
                        // ],
                    },
                    // отвечает за файлы изображений.
                    {
                        test: /\.(jpe?g|png|gif|svg)$/,
                        use: {
                            // подгружает файлы картинок которые прописаны в стилях
                            loader: 'url-loader',
                            options: {
                                // если размер файла меньше указаного лимита картинка из стилей подключается в base64
                                limit: 8000,
                                // меняет слешы на линуксовские
                                name(url) {
                                    const destination = path.relative(path.resolve(__dirname, 'src'), url);

                                    return destination.replace(/[\\\/]+/g, '/');
                                },
                                publicPath: '..',

                            },
                        },
                    },
                    // отвечает за файлы шрифтов
                    {
                        test: /\.(woff|woff2|eot|ttf|otf)$/,
                        use: [
                            {
                                loader: 'file-loader',
                                options: {
                                    // меняет слешы на линуксовские
                                    name(url) {
                                        const destination = path.relative(path.resolve(__dirname, 'src'), url);

                                        return destination.replace(/[\\\/]+/g, '/');
                                    },
                                    publicPath: '..',
                                },
                            },
                        ],
                    },

                    {
                        test: /\.pug$/,
                        loader: 'pug-loader',
                        options: {
                            pretty: true
                        }
                    },
                ],

            },

            resolve: {
                alias: {
                    'vue$': 'vue/dist/vue.esm.js',
                    Components: path.resolve(__dirname, 'src/js/Components/'),
                    '$': 'jquery',
                    'jQuery': 'jquery',
                    'window.jQuery': 'jquery',
                },
                extensions: ['.vue', '.js', '.json'],
            },

            plugins: [
                // Показывет в консоли прогресс компиляции
                new ProgressBarPlugin(),

                // Компиляция css
                new MiniCssExtractPlugin({
                        filename: 'css/[name].min.css',
                    },
                ),
                // Копирование файлов
                new CopyWebpackPlugin({
                    patterns: [
                        {
                            from: './src/images',
                            to: 'images',
                        },
                    ],
                }),

                new webpack.ProvidePlugin({
                    '$': 'jquery',
                    'jQuery': 'jquery',
                    'window.jQuery': 'jquery',
                }),

                new HtmlWebpackPugPlugin({
                        adjustIndent: true
                    }
                ),

                new VueLoaderPlugin(),

                new RemoveEmptyScriptsPlugin(),
            ],

            entry: {
                main: [
                    './src/js/main.js',
                    './src/styles/main.scss'
                ],
            },
        };

    if (!prodMode) {
        config.plugins.push(...[
            ...PAGES.map( page => new HtmlWebpackPlugin({
                template: `${PAGES_DIR}/${page}`,
                filename: `./${page.replace(/\.pug/, '.html')}`,
                chunks: [ page.replace(/\.pug/, ''), 'main' ],
                minify: false
            }))
        ]);

        config.entry = Object.assign(config.entry, ...PAGES.map( page => {
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
        console.log('Auto generated chunks: ', config.entry)
    }

    return config;
};






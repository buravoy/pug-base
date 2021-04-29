const path = require('path')
const fs = require('fs')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const {VueLoaderPlugin} = require('vue-loader')

const PATHS = {
    src: path.join(__dirname, '../src'),
    build: path.join(__dirname, '../build'),
    assets: 'assets'
}

const devMode = env === 'dev' ? env : false;
const prodMode = env === 'prod' ? env : false;

const PAGES_DIR = `${PATHS.src}/pug/pages/`
const PAGES = fs.readdirSync(PAGES_DIR).filter(fileName => fileName.endsWith('.pug'))

module.exports = {
    externals: {
        paths: PATHS
    },

    output: {
        filename: 'js/[name].js',
        // Путь куда компилируются файлы
        path: path.resolve(__dirname, PATHS.build),
        publicPath: '/',
    },

    devtool: devMode ? 'source-map' : false,

    optimization: {
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all',
                },
            },
        },
    },

    devServer: {
        // При запуске открывает сразу в браузере
        open: true,
        // Показывает ошибки в окне браузера
        overlay: true,
    },

    module: {
        rules: [
            {
                test: /\.pug$/,
                oneOf: [
                    // this applies to <template lang="pug"> in Vue components
                    {
                        resourceQuery: /^\?vue/,
                        use: ['pug-plain-loader']
                    },
                    // this applies to pug imports inside JavaScript
                    {
                        use: ['pug-loader']
                    }
                ]
            }, {
                test: /\.js$/,
                use: 'babel-loader',
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
                test: /\.(sc|c)ss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader?sourceMap',
                    'postcss-loader?sourceMap',
                    'sass-loader?sourceMap',
                ],
            },
            // отвечает за файлы styl
            {
                test: /\.styl$/,
                loader: [
                    devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
                    'css-loader',
                    'postcss-loader',
                    'stylus-loader',
                ],
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
        ]
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
        new MiniCssExtractPlugin(
            {
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
        new VueLoaderPlugin(),
    ],

    entry: {
        general : [
            './src/js/main.js',
            './src/styles/main.scss'
        ],

        index: [
            './src/js/pages/index.js',
            './src/styles/pages/index.scss'
        ],

    },

    // plugins: [
    //     new VueLoaderPlugin(),
    //
    //     new MiniCssExtractPlugin({
    //         filename: `${PATHS.assets}css/[name].css`,
    //     }),
    //
    //     new CopyWebpackPlugin([
    //         {from: `${PATHS.src}/${PATHS.assets}img`, to: `${PATHS.assets}img`},
    //         {from: `${PATHS.src}/${PATHS.assets}fonts`, to: `${PATHS.assets}fonts`},
    //     ]),
    //
    //     ...PAGES.map(page => new HtmlWebpackPlugin({
    //         template: `${PAGES_DIR}/${page}`,
    //         filename: `./${page.replace(/\.pug/, '.html')}`
    //     }))
    // ],
};

if (!prodMode) {
    conf.plugins.push(...[

        new HtmlWebpackPlugin({
            template: './src/layouts.html',
            filename: 'layouts.html',
            chunks: []
        }),

        new HtmlWebpackPlugin({
            template: './src/index.html',
            filename: 'index.html',
            chunks: [ 'index', 'general' ]
        }),

        new HtmlWebpackPlugin({
            template: './src/404.html',
            filename: '404.html',
            chunks: [ '404', 'general' ]
        }),

        new HtmlWebpackPlugin({
            template: './src/agreement.html',
            filename: 'agreement.html',
            chunks: [ 'agreement', 'general' ]
        }),

        new HtmlWebpackPlugin({
            template: './src/platforms.html',
            filename: 'platforms.html',
            chunks: [ 'platforms', 'general' ]
        }),

        new HtmlWebpackPlugin({
            template: './src/metatrader.html',
            filename: 'metatrader.html',
            chunks: [ 'metatrader', 'general' ]
        }),

        new HtmlWebpackPlugin({
            template: './src/contactus.html',
            filename: 'contactus.html',
            chunks: [ 'contactus', 'general' ]
        }),

        new HtmlWebpackPlugin({
            template: './src/rates.html',
            filename: 'rates.html',
            chunks: [ 'rates', 'general' ]
        }),

        new HtmlWebpackPlugin({
            template: './src/rates-detail.html',
            filename: 'rates-detail.html',
            chunks: [ 'rates', 'general' ]
        }),

        new HtmlWebpackPlugin({
            template: './src/about.html',
            filename: 'about.html',
            chunks: [ 'about', 'general' ]
        }),

        new HtmlWebpackPlugin({
            template: './src/whatsnew.html',
            filename: 'whatsnew.html',
            chunks: [ 'whatsnew', 'general' ]
        }),

        new HtmlWebpackPlugin({
            template: './src/whatsnew-detail.html',
            filename: 'whatsnew-detail.html',
            chunks: [ 'whatsnew', 'general' ]
        }),

        new HtmlWebpackPlugin({
            template: './src/markets.html',
            filename: 'markets.html',
            chunks: [ 'markets', 'general' ]
        }),

        new HtmlWebpackPlugin({
            template: './src/markets-requirements.html',
            filename: 'markets-requirements.html',
            chunks: [ 'markets', 'general']
        }),

        new HtmlWebpackPlugin({
            template: './src/analysis.html',
            filename: 'analysis.html',
            chunks: [ 'analysis', 'general' ]
        }),

        new HtmlWebpackPlugin({
            template: './src/analysis-category.html',
            filename: 'analysis-category.html',
            chunks: [ 'analysis', 'general' ]
        }),

        new HtmlWebpackPlugin({
            template: './src/article.html',
            filename: 'article.html',
            chunks: [ 'article', 'general' ]
        }),

        new HtmlWebpackPlugin({
            template: './src/events.html',
            filename: 'events.html',
            chunks: [ 'events', 'general' ]
        }),

        new HtmlWebpackPlugin({
            template: './src/calendar.html',
            filename: 'calendar.html',
            chunks: [ 'calendar', 'general' ]
        }),

        new HtmlWebpackPlugin({
            template: './src/search.html',
            filename: 'search.html',
            chunks: [ 'search', 'general' ]
        }),

        new HtmlWebpackPlugin({
            template: './src/interest-rates.html',
            filename: 'interest-rates.html',
            chunks: [ 'interest', 'general' ]
        }),

        new HtmlWebpackPlugin({
            template: './src/investing.html',
            filename: 'investing.html',
            chunks: [ 'investing', 'general']
        }),

        new HtmlWebpackPlugin({
            template: './src/portfolios-active.html',
            filename: 'portfolios-active.html',
            chunks: [ 'portfolios', 'general' ]
        }),

        new HtmlWebpackPlugin({
            template: './src/portfolios-closed.html',
            filename: 'portfolios-closed.html',
            chunks: [ 'portfolios', 'general' ]
        }),
    ]);
}

return conf;

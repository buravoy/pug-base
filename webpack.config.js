const path = require('path'),
    ProgressBarPlugin = require('progress-bar-webpack-plugin'),
    CopyWebpackPlugin = require('copy-webpack-plugin'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    VueLoaderPlugin = require('vue-loader/lib/plugin'),
    webpack = require('webpack'),
    MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = env => {
  /* присваиваем зависимость dev в зависимости от запущенной клманды. Проставляется в package.json scripts --env  */
  const devMode = env === 'dev' ? env : false;
  const wholeProjectPublicPath = '../../public';
  const prodMode = env === 'production' ? env : false;
  const buildPath = !prodMode ? `${wholeProjectPublicPath}/build` : wholeProjectPublicPath;

  const conf = {
    // Точка выхода для js
    output: {
      // Имя выходного js файла. [name] - подставляется имя тчоки входа
      filename: 'js/[name].js',
      // Путь куда компилируются файлы
      path: path.resolve(__dirname, buildPath),
      publicPath: '/',
    },
    // Отвечает за sourceMaps
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

        {
          test: /\.pug$/,
          oneOf: [
            {
              resourceQuery: /^\?vue/,
              use: ['pug-plain-loader']
            },
            {
              use: ['pug-loader']
            }
          ]
        }
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

    // Точки входа
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
  };
  // Все выходные точки теперь задаются в массиве ниже, по аналогии с другими
  if (!prodMode) {
    conf.plugins.push(...[

      new HtmlWebpackPlugin({
        template: './src/pug/index.pug',
        filename: 'index.html',
        chunks: [ 'index', 'general' ]
      }),

    ]);
  }

  return conf;
};






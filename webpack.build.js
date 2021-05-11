const
    path = require('path'),
    fs = require('fs'),
    { merge } = require('webpack-merge'),
    common = require('./webpack.common.js'),
    RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts'),
    WebpackShellPluginNext = require('webpack-shell-plugin-next'),
    beautifyHtml = require('js-beautify').html,
    buildPath = './build/';


module.exports = merge(common, {
    mode: 'production',
    output: {
        filename: 'js/[name].min.js',
        path: path.resolve(__dirname, buildPath),
    },
    plugins: [
        new RemoveEmptyScriptsPlugin(),

        new WebpackShellPluginNext({
            onAfterDone:{
                scripts: [
                    function (){
                        const files = fs.readdirSync(buildPath).filter(fileName => fileName.endsWith('.html'));
                        console.log(['Beautifying HTML'])
                        files.map(file => {
                            fs.readFile(buildPath + file, 'utf8', function (err, data) {
                                if (err)  throw err;
                                fs.writeFile(buildPath + file, beautifyHtml(data, {
                                    indent_size: 2,
                                    space_in_empty_paren: true
                                }), 'utf8', function (err) {
                                    if (err) throw err;
                                    else console.log(file, ['success'])
                                });
                            });
                        })
                    },
                ],
                blocking: true,
            }
        })
    ],
});

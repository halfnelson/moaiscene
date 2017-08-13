var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry: "./appSrc/main.tsx",
    output: {
        filename: "./app/app/main.js",
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: [ ".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
    },

    module: {
        loaders: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
            { 
                test: /\.tsx?$/, 
                loader: "ts-loader" 
            },
            {
                test: /\.less$|\.css$/,
                loader: ExtractTextPlugin.extract('css-loader?sourceMap!less-loader?sourceMap')
            }

        ],
    },
    plugins: [
        // extract inline css into separate 'styles.css'
        new ExtractTextPlugin('./app/app/css/styles.css')
    ],
    target: "electron-renderer",
    // When importing a module whose path matches one of the following, just
    // assume a corresponding global variable exists and use that instead.
    // This is important because it allows us to avoid bundling all of our
    // dependencies, which allows browsers to cache those libraries between builds.

    externals: {
        "react": "React",
        "react-dom": "ReactDOM"
    },

};
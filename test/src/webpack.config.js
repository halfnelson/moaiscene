
module.exports = 
/* test */
{
    entry: "./all.js",
    output: {
        filename: "../unit/all.js",
    },

    // Enable sourcemaps for debugging webpack's output.
    devtool: "source-map",

    resolve: {
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js"]
    },

    module: {
        loaders: [
            // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
            { 
                test: /\.tsx?$/, 
                loader: "ts-loader" 
            },
        ],
    },
    target: "node"   
    
}

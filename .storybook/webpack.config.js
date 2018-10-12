let webpack = require('webpack');

module.exports = {
    entry: "./dev/index.js",
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            }
        ]
    },
    node: {
        fs: "empty"
    },
    plugins: [
        new webpack.EnvironmentPlugin([
            "LOCAL_DEVELOPMENT"
        ])
    ]
};

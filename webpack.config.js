const path = require('path');

const SRC_DIR = path.resolve(__dirname, 'src');
const OUT_DIR = path.resolve(__dirname, 'dist');

const config = {
    mode: "production",
    entry: SRC_DIR+"/index.js",
    output: {
        path: OUT_DIR,
        filename: 'AirtableDriveUtils.js',
        library: 'AirtableDriveUtils',
        libraryTarget: 'var'
    },
    target: 'web'
};

module.exports = config;

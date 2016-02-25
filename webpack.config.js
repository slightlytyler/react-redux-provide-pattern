var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'index.js',
    libraryTarget: 'commonjs2'
  },
  module: {
    loaders: [
      {
        test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        include: __dirname,
        query: {
          presets: ['es2015', 'react', 'stage-1']
        }
      }
    ]
  },
  externals: {
    react: 'react',
    'react-dom': 'react-dom',
    redux: 'redux',
    'react-redux': 'react-redux',
    'lodash.capitalize': 'lodash.capitalize',
    'lodash.uppercase': 'lodash.uppercase',
    'lodash.intersection': 'lodash.intersection',
    'lodash.keys': 'lodash.keys',
    'lodash.map': 'lodash.map',
    'lodash.omit': 'lodash.omit',
    'lodash.without': 'lodash.without',
    'lodash.zipobject': 'lodash.zipobject',
    'update-in': 'update-in'
  }
};
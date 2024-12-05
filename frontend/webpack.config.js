const path = require('path');

module.exports = {
  resolve: {
    fallback: {
      fs: false, // or 'path' if you need fs
      "zlib": require.resolve('browserify-zlib'), // add browserify-zlib as a fallback for zlib
      stream: require.resolve('stream-browserify'),
      assert: require.resolve('assert'),
      util: require.resolve('util'),
      buffer: require.resolve('buffer'),
      
    },
    
  },
  // other webpack config...
};

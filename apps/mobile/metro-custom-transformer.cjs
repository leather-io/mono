const upstreamTransformer = require('metro-babel-transformer');
const reactNativeTransformer = require('@react-native/metro-babel-transformer');
const poTransformer = require('@lingui/metro-transformer/expo');
const svgTransformer = require('react-native-svg-transformer');

module.exports.transform = function ({ src, filename, options }) {
  if (filename.endsWith('.po')) {
    return poTransformer.transform({ src, filename, options });
  } else if (filename.endsWith('.svg')) {
    return svgTransformer.transform({ src, filename, options });
  }
  return reactNativeTransformer.transform({ src, filename, options });
  //  else {
  //   return upstreamTransformer.transform({ src, filename, options });
  // }
};

// PETE - this is not working  is it that I need to just not transform other files?

// it seems like this is working but somewhere else is not

// before we only transformed svg files  and had no fallback

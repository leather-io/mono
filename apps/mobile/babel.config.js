module.exports = function (api) {
  api.cache(true);

  return {
    presets: [
      [
        'babel-preset-expo',
        {
          'react-compiler': {
            // Run the React Compiler on all files by always returning true
            sources: () => true,
          },
        },
      ],
    ],
  };
};

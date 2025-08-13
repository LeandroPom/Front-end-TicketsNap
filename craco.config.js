module.exports = {
    webpack: {
      configure: (webpackConfig) => {
        webpackConfig.resolve.fallback = {
        
        };
        return webpackConfig;
      },
    },
  };
  
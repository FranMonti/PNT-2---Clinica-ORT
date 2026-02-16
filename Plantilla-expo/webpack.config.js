const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // 🔹 Alias para resolver el módulo faltante
  config.resolve.alias['../Utilities/Platform'] =
    'react-native-web/dist/exports/Platform';

  return config;
};

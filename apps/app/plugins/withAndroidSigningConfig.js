const { withAppBuildGradle } = require("expo/config-plugins");

module.exports = function withAndroidSigningConfig(config) {
  return withAppBuildGradle(config, (config) => {
    const buildGradle = config.modResults.contents;

    // Add release signing config that reads from gradle.properties
    config.modResults.contents = buildGradle
      .replace(
        /signingConfigs\s*\{[^}]*debug\s*\{[^}]*\}[^}]*\}/s,
        `signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            storeFile file(findProperty('RELEASE_STORE_FILE') ?: 'release.keystore')
            storePassword findProperty('RELEASE_STORE_PASSWORD') ?: ''
            keyAlias findProperty('RELEASE_KEY_ALIAS') ?: ''
            keyPassword findProperty('RELEASE_KEY_PASSWORD') ?: ''
        }
    }`
      )
      .replace(
        /signingConfig signingConfigs\.debug\n(\s*)}/,
        `signingConfig signingConfigs.release\n$1}`
      );

    return config;
  });
};

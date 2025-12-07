const path = require('path');

module.exports = {
  packagerConfig: {
    asar: true,
    extraResource: [
      path.join(__dirname, 'assets'),
      path.join(__dirname, '..', 'react', 'dist')
    ],
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-zip',
      platforms: ['win32'],
    },
  ],
  plugins: [],
};









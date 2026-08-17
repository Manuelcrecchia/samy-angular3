module.exports = function configureMobileKarma(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('@angular-devkit/build-angular/plugins/karma'),
    ],
    reporters: ['progress', 'kjhtml'],
    client: {
      clearContext: false,
      jasmine: { random: false },
    },
    customLaunchers: {
      ChromeHeadlessMobile: {
        base: 'ChromeHeadless',
        flags: [
          // Chrome headless sottrae 15px per la scrollbar dal viewport interno.
          '--window-size=515,760',
          // Il test misura larghezze CSS: un DPR forzato diverso da 1 rendeva
          // il viewport differente dai 500px attesi e saltava l'intera suite.
          '--force-device-scale-factor=1',
          '--high-dpi-support=1',
        ],
      },
    },
    browsers: ['ChromeHeadlessMobile'],
  });
};

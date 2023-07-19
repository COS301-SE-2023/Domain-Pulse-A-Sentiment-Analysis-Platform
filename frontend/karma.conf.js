module.exports = function (config) {
    config.set({
      basePath: "",
      frameworks: ["jasmine", "@angular-devkit/build-angular"],
      plugins: [
        require("karma-jasmine"),
        require("karma-chrome-launcher"),
        require("karma-jasmine-html-reporter"),
        require("karma-coverage"),
        require("@angular-devkit/build-angular/plugins/karma"),
      ],
      client: {
        jasmine: {},
        clearContext: false, // leave Jasmine Spec Runner output visible in browser
      },
      jasmineHtmlReporter: {
          suppressAll: true // removes the duplicated traces
      },
      coverageReporter: {
          dir: require('path').join(__dirname, './coverage'),
          subdir: '.',
          reporters: [
          { type: 'html', subdir: 'html-report' },
          { type: 'lcov', subdir: 'lcov-report' }
          ]
      },
      angularCli: {
        environment: "dev",
      },
      reporters: ["progress", "kjhtml"],
      port: 9876,
      colors: true,
      logLevel: config.LOG_INFO,
      autoWatch: true,
      browsers: ["Chrome"],
      singleRun: true,
      restartOnFileChange: true,
    });
  };
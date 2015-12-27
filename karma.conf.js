var karma = require('karma');

module.exports = function(config) {
    config.set({
        basePath: './',
        frameworks: ['browserify', 'jasmine'],
        preprocessors: {
            'src/**/*.js': ['browserify'],
            'test/**/*.js': ['browserify']
        },
        files: [
            'test/**/*Spec.js'
        ],

        browserify: {
            debug: true,
            configure: function(bundle) {
                bundle.once('prebundle', function() {
                    bundle
                        .add(require.resolve("babel-polyfill"))
                        .transform('babelify', { presets: ['es2015'] });
                });
            }
        },
        browsers: ['PhantomJS'],
        port: 9876,
        colors: true,
        logLevel: karma.LOG_INFO
    });
};

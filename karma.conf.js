module.exports = function(config) {
    config.set({
        basePath: '',

        // frameworks to use
        frameworks: ['jasmine', 'requirejs', 'traceur'],

        preprocessors: {
            '**/*.es6': ['traceur']
        },

        files: [
            {pattern: 'src/**/*.es6', included: false},
            {pattern: 'test/**/*Spec.es6', included: false},
            'test/test-main.js'
        ],

        traceurPreprocessor: {
            options: {
                sourceMap: true,
                modules: 'amd',
                annotations: true,
                types: true,
                experimental: true
            }
        },

        browsers: ['Firefox']
    });
};

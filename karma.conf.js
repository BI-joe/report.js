module.exports = function(config) {
    config.set({
        basePath: './',

        // frameworks to use
        frameworks: ['jasmine', 'requirejs', 'traceur'],

        preprocessors: {
            'src/**/*.js': ['traceur'],
            'test/**/*Spec.js': ['traceur']
        },

        files: [
            {pattern: 'src/**/*.js', included: false},
            {pattern: 'test/**/*Spec.js', included: false},

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

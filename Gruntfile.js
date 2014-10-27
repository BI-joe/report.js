module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-traceur');
  grunt.loadNpmTasks('grunt-text-replace');

  grunt.initConfig({

    clean: ["tmp", "dist"],

    traceur: {
      options: {
        modules: 'amd',
        experimental: true
      },
      custom: {
        files: [{
          expand: true,
          cwd: 'src',
          src: ['**/*.es6'],
          dest: 'tmp/amd',
          ext: '.amd.js'
        }]
      }
    },

    concat: {
      amd: {
        src: 'tmp/amd/**/*.amd.js',
        dest: 'tmp/reportjs.amd.js'
      },
    },

    // Temporary because of a traceur bug in module names
    replace: {
      dist: {
        replacements: [{
            from: '"src_',
            to: '"'
          }
        ],
        src: ['tmp/reportjs.amd.js'],
        dest: 'dist/'
      }
    },

    browser: {
      dist: {
        src: ['node_modules/traceur/bin/traceur-runtime.js', 'vendor/loader.js', 'dist/reportjs.amd.js'],
        dest: 'dist/reportjs.js',
        options: {
          barename: 'reportjs',
          namespace: 'reportjs'
        }
      }
    }
  });

  grunt.registerMultiTask('browser', 'Export a module to the window', function() {
    var opts = this.options();
    this.files.forEach(function(f) {
      var output = ['(function(globals) {'];

      output.push.apply(output, f.src.map(grunt.file.read));

      output.push(grunt.template.process(
        'window.<%= namespace %> = requireModule("<%= barename %>");', {
        data: {
          namespace: opts.namespace,
          barename: opts.barename
        }
      }));
      output.push('})(window);');

      grunt.file.write(f.dest, grunt.template.process(output.join("\n")));
    });
  });

  grunt.registerTask('default', ['clean', 'traceur', 'concat:amd', 'replace', 'browser']);
};

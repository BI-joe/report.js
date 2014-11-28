var gulp       = require('gulp');
var browserify = require('browserify');
var traceur    = require('gulp-traceur');
var source     = require('vinyl-source-stream');
var es6ify     = require('es6ify');

// Basic usage
gulp.task('browser', function() {
  return browserify()
    .add(es6ify.runtime)
    .transform(es6ify)
    .require(require.resolve('./vendor/loader.js'), { entry: true })
    .bundle()
    .pipe(source('reportjs.js'))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('cjs', function() {
  gulp.src('src/**/*.js')
    .pipe(traceur({modules: 'commonjs'}))
    .pipe(gulp.dest('dist/cjs'));
});

gulp.task('default', ['browser', 'cjs']);

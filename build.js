'use strict';

var path       = require('path')
  , fs         = require('fs')
  , browserify = require('browserify')
  , es6ify     = require('es6ify')
  ;

browserify({ debug: true })
  .add(es6ify.runtime)
  .transform(es6ify)
  .require(require.resolve('./vendor/loader.js'), { entry: true })
  .bundle()
  .on('error', function (err) { console.error(err); })
  .pipe(fs.createWriteStream('dist/reportjs.js'));

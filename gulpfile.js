var gulp = require('gulp');
var server = require('gulp-express');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var uglify = require('gulp-uglify');
var plumber = require('gulp-plumber');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');
var nodemon = require('gulp-nodemon');
var livereload = require('gulp-livereload');
var concat = require('gulp-concat');
var nodeInspector = require('gulp-node-inspector');
var browserifyCss = require('browserify-css');
var configify = require('config-browserify');

var config = {
  bootstrapDir: './node_modules/bootstrap-sass',
  srcDir: './clientsrc',
  publicDir: './public'
}

gulp.task("sass", function() {
  return gulp.src(config.srcDir + "/sass/**/*scss")
    .pipe(plumber())
    .pipe(concat('style.scss'))
    .pipe(sass({
      includePaths: [config.bootstrapDir + '/assets/stylesheets']
    }))
    .pipe(autoprefixer())
    .pipe(gulp.dest(config.publicDir + '/css'));
});

gulp.task("fonts", function() {
  return gulp.src(config.bootstrapDir + '/assets/fonts/**/*')
    .pipe(gulp.dest(config.publicDir + '/fonts'));
});

gulp.task('js', function() {
  browserify({
    entries: [config.srcDir + "/js/main.js"], // ビルド対象のファイル
    debug: true, // sourcemapを出力、chromeでのdebug可能にする
  })
  .transform(browserifyCss)
  .transform(configify)
  .bundle()
  .on('error', console.error.bind(console)) // js compileエラーでもwatchを止めない
  .pipe(source("app.js")) // ビルド後のファイル名
  .pipe(buffer())
  .pipe(sourcemaps.init({loadMaps: true}))
  .pipe(sourcemaps.write("./"))
  .pipe(gulp.dest(config.publicDir + "/js/")); // 生成先の指定
});

gulp.task('js-release', function() {
  browserify({
    entries: [config.srcDir + "/js/main.js"], // ビルド対象のファイル
    debug: true, // sourcemapを出力、chromeでのdebug可能にする
  })
  .transform(browserifyCss)
  .transform(configify)
  .bundle()
  .on('error', console.error.bind(console)) // js compileエラーでもwatchを止めない
  .pipe(source("app.js")) // ビルド後のファイル名
  .pipe(buffer())
  .pipe(sourcemaps.init({loadMaps: true}))
  .pipe(uglify())
  .pipe(sourcemaps.write("./"))
  .pipe(gulp.dest(config.publicDir + "/js/")); // 生成先の指定
});

gulp.task('server', function() {
  var options = {};
  var livereload = false;
  server.run(['server.js'], options, livereload);
});

// node-inspector -> http://localhost:3002/?ws=localhost:3002&port=5858
gulp.task('inspect', function() {
  gulp.src([]).pipe(nodeInspector({
      debugPort: 5858,
      webHost: 'localhost',
      webPort: '3002',
      preload: false
  }));
});

gulp.task('debugserver', ['inspect'],  function() {
  livereload.listen();

  nodemon({
    script: './server.js',
    ext: 'js, json',
    exec: 'node --debug',
    ignore: [
      'views',
      'public',
      'clientsrc'
    ],
    env: {
      'NODE_ENV': 'development'
    }
  });

});

gulp.task('watch', function() {
  gulp.watch([config.srcDir + "/js/**/*.js"], ["js"]);
  gulp.watch([config.srcDir + "/sass/**/*.scss"], ["sass", "js"]); // jsでcssをrequireしているのでjsも実行する
  gulp.watch([config.publicDir + "/**/*.*", "./views/**/*.*"], function(e) {
    livereload.changed(e);
  });
});

gulp.task("default", [
  'sass',
  'fonts',
  'js',
  'debugserver',
  'watch'
]);

gulp.task("build", [
  'sass',
  'fonts',
  'js-release'
]);

gulp.task("run", [
  'sass',
  'fonts',
  'js',
  'server'
]);



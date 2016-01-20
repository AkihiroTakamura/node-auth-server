var gulp = require('gulp');
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

gulp.task("sass", function() {
  gulp.src("./clientsrc/sass/**/*scss")
    .pipe(plumber())
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(gulp.dest("./public/css"))
});

gulp.task('js', function() {
  browserify({
    entries: ["./clientsrc/js/main.js"], // ビルド対象のファイル
    debug: true, // sourcemapを出力、chromeでのdebug可能にする
    transform: ['cssify']
  })
  .bundle()
  .pipe(plumber())
  .pipe(source("app.js")) // ビルド後のファイル名
  .pipe(buffer())
  .pipe(sourcemaps.init({loadMaps: true}))
  .pipe(uglify())
  .pipe(sourcemaps.write("./"))
  .pipe(gulp.dest("./public/js/")); // 生成先の指定
});

gulp.task('debugserver', function() {
  livereload.listen();

  nodemon({
    exec: 'node-inspector --web-port 3002 & node --debug',
    script: './server.js',
    ext: 'js, json',
    ignore: [   // nodemon ignore directory
      'views',
      'public',
      'clientsrc'
    ],
    env: {
      'NODE_ENV': 'development'
    },
    stdout: false
  }).on('readable', function() {
    this.stdout.on('data', function(chunk) {
      if (/^application\ started/.test(chunk)) {
        livereload.reload();
      }
      process.stdout.write(chunk);
    });
    this.stderr.on('data', function(chunk) {
      process.stderr.write(chunk);
    });
  });

});

gulp.task('watch', function() {
  gulp.watch(["./clientsrc/js/**/*.js"], ["js"]);
  gulp.watch(["./clientsrc/sass/**/*.scss"], ["sass"]);
  gulp.watch(["./public/**/*.*", "./views/**/*.*"], function(e) {
    livereload.changed(e);
  });
});

gulp.task("default", [
  'debugserver',
  'sass',
  'js',
  'watch'
]);

gulp.task("build", [
  'sass',
  'js'
]);

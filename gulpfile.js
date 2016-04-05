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

gulp.task("sass", function() {
  gulp.src("./clientsrc/sass/**/*scss")
    .pipe(plumber())
    .pipe(concat('style.scss'))
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
  .on('error', console.error.bind(console)) // js compileエラーでもwatchを止めない
  .pipe(source("app.js")) // ビルド後のファイル名
  .pipe(buffer())
  .pipe(sourcemaps.init({loadMaps: true}))
  .pipe(uglify())
  .pipe(sourcemaps.write("./"))
  .pipe(gulp.dest("./public/js/")); // 生成先の指定
});

gulp.task('server', function() {
  var options = {};
  var livereload = false;
  server.run(['server.js'], options, livereload);
});

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
  gulp.watch(["./clientsrc/js/**/*.js"], ["js"]);
  gulp.watch(["./clientsrc/sass/**/*.scss"], ["sass", "js"]); // jsでcssをrequireしているのでjsも実行する
  gulp.watch(["./public/**/*.*", "./views/**/*.*"], function(e) {
    livereload.changed(e);
  });
});

gulp.task("default", [
  'sass',
  'js',
  'debugserver',
  'watch'
]);

gulp.task("build", [
  'sass',
  'js'
]);

gulp.task("run", [
  'sass',
  'js',
  'server'
]);



// 'use strict';

var gulp = require('gulp'),
    pug = require('gulp-pug'),
    del = require('del'),
    sass = require('gulp-sass'),
    uglify = require('gulp-uglify'),
    watch = require('gulp-watch'),
    browserSync = require('browser-sync').create();

var port = process.env.PORT || 45123;
var node_modules = 'node_modules/';

var js_files = [
  node_modules + 'jquery/jquery.min.js',
  node_modules + 'bootstrap/dist/js/bootstrap.min.js'
]

// Pre-processing
gulp.task('clean', function(){
  return del(['dist/**/*']);
});

// Copy assets
gulp.task('copy-vendor-js', function(){
  gulp.src(js_files)
    .pipe(gulp.dest('./dist/vendor/js'));
});

gulp.task('assets', ['copy-vendor-js']);

// JS
gulp.task('js', function(){
  return gulp.src(['./src/js/app.js'])
    .pipe(uglify())
    .pipe(gulp.dest('./dist/js'))
});

// Sass
var sass_files = ['./src/scss/theme.scss', './src/scss/custom.sass']
gulp.task('sass', function(){
  return gulp.src(sass_files)
    .pipe(sass(
            {
              errLogToconsole: true,
              outputStyle: 'expanded',
              includePaths: node_modules
            }
          ).on('error', sass.logError))
    .pipe(gulp.dest('./dist/css'))
    .pipe(browserSync.stream());
});

// Pug
gulp.task('pug', function(){
  return gulp.src('./src/index.pug')
    .pipe(pug())
    .pipe(gulp.dest('./dist'));
});

// Build
gulp.task('build',  ['assets', 'js', 'sass', 'pug'] );

// Watch

gulp.task('watch', function(){
  gulp.watch('./src/scss/**/*', ['sass', browserSync.reload]);
  gulp.watch('./src/js/app.js', ['js', browserSync.reload]);
  gulp.watch('./src/**/*', ['pug', browserSync.reload]);
});

// Browser
gulp.task('server', ['build'], function(){
  browserSync.init({
    server: './dist',
    port: port
  });
});

gulp.task('default', ['clean'], function(){
  gulp.start('server', 'watch');
});


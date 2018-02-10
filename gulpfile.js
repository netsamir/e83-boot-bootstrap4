// 'use strict';

var gulp = require('gulp'),
    pug = require('gulp-pug'),
    del = require('del'),
    rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    postcssFlexbugsFixes = require('postcss-flexbugs-fixes'),
    mq4HoverShim = require('mq4-hover-shim'),
    autoprefixer = require('autoprefixer'),
    cssnano = require('gulp-cssnano'),
    uglify = require('gulp-uglify'),
    postcss = require('gulp-postcss'),
    watch = require('gulp-watch'),
    imagemin = require('gulp-imagemin'),
    plumber = require('gulp-plumber'),
    browserSync = require('browser-sync').create();

//-----------------------------------------------------------------------------
// GLOBAL VARIABLES
//-----------------------------------------------------------------------------

var port = process.env.PORT || 45123;
var node_modules = 'node_modules/';


//-----------------------------------------------------------------------------
// CLEANING
//-----------------------------------------------------------------------------

gulp.task('clean', function(){
  return del(['dist/**/*']);
});

//-----------------------------------------------------------------------------
// COLLECT THIRD PARTY STATIC ASSETS
//-----------------------------------------------------------------------------
//
// INFO: `src/_layout.pug` should be updated with the following assets

// js files
var js_files = [
  node_modules + 'jquery/jquery.min.js',
  node_modules + 'bootstrap/dist/js/bootstrap.min.js',
  node_modules + 'popper.js/dist/popper.min.js'
]

gulp.task('vendors-js', function(){
  gulp.src(js_files)
    .pipe(gulp.dest('./dist/vendors/js'));
});

// css files
var css_files = []

gulp.task('vendors-css', function(){
  gulp.src(css_files)
    .pipe(gulp.dest('./dist/vendors/css'));
});

var assets_files = []

// complex structures
// INFO: User will copy his assets in `src/assets` and update `src/_layout.pug`
//       with the path
gulp.task('vendors-assets', function () {
    return gulp.src(['./src/assets/**/*'])
        .pipe(gulp.dest('./dist/vendors/assets'))
    });

gulp.task('thirdparty-assets', ['vendors-css', 'vendors-js', 'vendors-assets']);

//-----------------------------------------------------------------------------
// COLLECT USER STATIC ASSETS
//-----------------------------------------------------------------------------

gulp.task('images', function(){
  return gulp.src('./src/images/*')
    .pipe(imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.jpegtran({progressive: true}),
      imagemin.optipng({optimizationLevel: 5}),
      imagemin.svgo({plugins: [{removeViewBox: true}]})
    ], {
      verbose: true
  }))
    .pipe(gulp.dest('./dist/images'))
});

// INFO: User will update the various config files
gulp.task('h5b', function(){
    return gulp.src(['./src/html5-boilerplate/*'])
        .pipe(gulp.dest('./dist'))
});

gulp.task('user-assets', ['images', 'h5b']);

//-----------------------------------------------------------------------------
// PROCESS JS/SASS/PUG files
//-----------------------------------------------------------------------------

// user js
gulp.task('js', function(){
  return gulp.src(['./src/js/app.js'])
    .pipe(uglify())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('./dist/js'))
});

// Sass

// Library was created to shim support for the feature into browsers that lack
// native support for `hover`. It should be used with postcss

var processor = [
  mq4HoverShim.postprocessorFor({ hoverSelectorPrefix: '.bs-true-hover ' }),
  autoprefixer({
    browsers: [
     // https://github.com/twbs/bootstrap/blob/v4.0.0/package.json
    "Chrome >= 45",
    "Firefox >= 38",
    "Edge >= 12",
    "Explorer >= 10",
    "iOS >= 9",
    "Safari >= 9",
    "Android >= 4.4",
    "Opera >= 30"
    ]
  }),
  postcssFlexbugsFixes(),
];

var sass_files = ['./src/scss/theme.scss', './src/scss/custom.sass']
gulp.task('sass', function(){
  return gulp.src(sass_files)
    .pipe(sourcemaps.init())
    .pipe(plumber())
    .pipe(sass(
            {
              errLogToconsole: true,
              outputStyle: 'expanded',
              includePaths: node_modules
            }
          ).on('error', sass.logError))
    .pipe(postcss(processor))
    .pipe(cssnano())
    .pipe(rename({suffix: '.min'}))
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest('./dist/css'))
    .pipe(browserSync.stream());
});

// Pug
gulp.task('pug', function(){
  return gulp.src('./src/templates/index.pug')
    .pipe(pug())
    .pipe(gulp.dest('./dist'));
});

//----------------------------------------------------------------------------
// WATCH FUNCTONS
//----------------------------------------------------------------------------

gulp.task('watch', function(){
  gulp.watch('./src/images/**/*', ['images', browserSync.reload]);
  gulp.watch('./src/js/**/*', ['js', browserSync.reload]);
  gulp.watch('./src/scss/**/*', ['sass', browserSync.reload]);
  gulp.watch('./src/templates/**/*', ['pug', browserSync.reload]);
  gulp.watch('./src/html5-boilerplate/*', ['h5b', browserSync.reload]);
});

//----------------------------------------------------------------------------
// BUILD AND RUN BROWSER
//----------------------------------------------------------------------------

gulp.task('build',  ['thirdparty-assets', 'user-assets', 'js', 'sass', 'pug'] );

gulp.task('server', ['build'], function(){
  browserSync.init({
    server: './dist',
    port: port
  });
});

gulp.task('default', ['clean'], function(){
  gulp.start('server', 'watch');
});


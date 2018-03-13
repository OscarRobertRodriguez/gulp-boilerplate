'use strict';

let gulp = require('gulp');
let uglify = require('gulp-uglify');
let refresh = require('gulp-refresh');
let livereload = require('gulp-livereload');
let concat = require('gulp-concat');
let cleanCSS = require('gulp-clean-css');
let sourcemaps = require('gulp-sourcemaps');
let autoprefixer = require('gulp-autoprefixer');
let plumber = require('gulp-plumber');
let sass = require('gulp-sass');
let babel = require('gulp-babel');
let del = require('del'); 
let zip = require('gulp-zip'); 
let jasmine = require('gulp-jasmine'); 
let bump = require('gulp-bump'); 
let git = require('gulp-git'); 
let filter = require('gulp-filter'); 
let tagVersion = require('gulp-tag-version'); 

//handlbars plugins
let handlebars = require('gulp-handlebars');
let handlebarsLib = require('handlebars'); 
let wrap = require('gulp-wrap'); 
let declare = require('gulp-declare');
// image compression
let imagemin = require('gulp-imagemin');
let imageminPngquant = require('imagemin-pngquant');
let imageminJpegRecompress = require('imagemin-pngquant'); 


// file paths
let SCRIPTS_PATH = 'public/scripts/**/*.js';
let CSS_PATH = 'public/css/**/*.css';
let SCSS_PATH = 'public/scss/styles.scss';
let TEMPLATES_PATH = 'templates/**/*.hbs'; 
let IMAGES_PATH =  'public/images/**/*.{png,jpeg,jpg,svg,gif}'; 
let DIST_PATH = 'dist';
let DIST_IMAGES = 'dist/images'; 
let DIST_SCSS = 'dist/scss';
let DIST_CSS = 'dist/css';
let DIST_SCRIPTS = 'dist/scripts'; 
let DIST_TEMPLATES = 'dist/templates'; 
// styles
// uncomment this block for plain css 
// gulp.task('styles', function() {
//   console.log('starting styles task');
//   return gulp.src(['public/css/reset.css', CSS_PATH])
//     .pipe(plumber(function (err) {
//       console.log('styles task error', err);
//       this.emit('end');
//     }))
//     .pipe(sourcemaps.init())
//     .pipe(autoprefixer())
//     .pipe(concat('styles.css'))
//     .pipe(cleanCSS())
//     .pipe(sourcemaps.write())
//     .pipe(gulp.dest(DIST_CSS))
//     .pipe(refresh()); 
// });

gulp.task('styles', function () {
  console.log("starting the scss task");
  return gulp.src(SCSS_PATH)
    .pipe(sourcemaps.init())
    .pipe(autoprefixer())
    .pipe(sass({
      outputStyle: 'compressed'
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(DIST_SCSS))
    .pipe(livereload());
});

//scripts
gulp.task('scripts', function () {
  console.log('starting styles task');
  return gulp.src(SCRIPTS_PATH)
    .pipe(plumber(function (err) {
      console.log('scripts task err');
      console.log(err);
    }))
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['env']
    }))
    .pipe(uglify())
    .pipe(concat('scripts.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(DIST_SCRIPTS))
    .pipe(livereload());
});


//Images
gulp.task('images', function () {
  console.log('starting images task');
  return gulp.src(IMAGES_PATH)
  .pipe(imagemin(
    [
      imagemin.gifsicle(),
      imagemin.jpegtran(),
      imagemin.optipng(),
      imagemin.svgo(),
      imageminPngquant(),
      imageminJpegRecompress()
    ]
  ))
  .pipe(gulp.dest(DIST_IMAGES)); 
});

gulp.task('clean', function () {
  return del.sync([
    DIST_PATH
  ]);
});

//templates 
gulp.task('templates', function () {
  console.log('startin templates task');
  return gulp.src(TEMPLATES_PATH)
  .pipe(handlebars({
    handlebars: handlebarsLib
  }))
  .pipe(wrap('Handlebars.template(<%= contents %>)'))
  .pipe(declare({
    namespace: 'templates',
    noRedeclare: true 
  }))
  .pipe(concat('templates.js'))
  .pipe(gulp.dest(DIST_TEMPLATES))
  .pipe(livereload()); 
  
});

gulp.task('build', ['clean','images', 'templates', 'styles', 'scripts'],  function () {
  console.log('starting default task');
});

gulp.task('test', function () {
  gulp.src(DIST_SCRIPTS)
  .pipe(jasmine()); 
}); 

gulp.task('export', function () {
  return gulp.src('public/**/*')
  .pipe(zip('website.zip'))
  .pipe(gulp.dest('./')); 
});





gulp.task('watch', ['build'], function () {
  console.log('starting watch task');
  livereload.listen();
  require('./server.js');
  gulp.watch(SCRIPTS_PATH, ['scripts']);
  // uncomment line below for css only
  // gulp.watch(CSS_PATH, ['styles']);
  gulp.watch(SCSS_PATH, ['styles']);
  gulp.watch(TEMPLATES_PATH, ['templates']);
});




function deploy(importance) {
  // get all the files to bump version in
  return gulp.src(['./package.json'])
    // bump the version number in those files
    .pipe(bump({ type: importance }))
    // save it back to filesystem
    .pipe(gulp.dest('./'))
    // commit the changed version number
    .pipe(git.commit('bumps package version'))
    .pipe(git.push('origin', 'master', '--tags'))

    // read only one file to get the version number
    .pipe(filter('package.json'))
    // **tag it in the repository**
    .pipe(tagVersion());
}


gulp.task('patch', function () { return deploy('patch'); });
gulp.task('feature', function () { return deploy('minor'); });
gulp.task('release', function () { return deploy('major'); });
// Defining base pathes
var basePaths = {
    bower: './bower_components/',
    node: './node_modules/',
    dev: './src/',
    customjs: './customjs/'
};

// browser-sync watched files
// automatically reloads the page when files changed
var browserSyncWatchFiles = [
    './css/*.min.css',
    './js/*.min.js',
    './**/*.php'
];

// browser-sync options
// see: https://www.browsersync.io/docs/options/
var browserSyncOptions = {
    server: true,
    notify: false
};


// Defining requirements
var gulp = require('gulp');
var plumber = require('gulp-plumber');
var sass = require('gulp-sass');
var watch = require('gulp-watch');
var cssnano = require('gulp-cssnano');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var merge2 = require('merge2');
var print = require('gulp-print')
var ignore = require('gulp-ignore');
var rimraf = require('gulp-rimraf');
var clone = require('gulp-clone');
var merge = require('gulp-merge');
var babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync').create();


// Run:
// gulp sass + cssnano + rename
// Prepare the min.css for production (with 2 pipes to be sure that "child-theme.css" == "child-theme.min.css")
gulp.task('scss-for-prod', function() {
    var source =  gulp.src('./sass/*.scss')
        .pipe(plumber())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sass());

    var pipe1 = source.pipe(clone())
        .pipe(sourcemaps.write(undefined, { sourceRoot: null }))
        .pipe(gulp.dest('./css'));

    var pipe2 = source.pipe(clone())
        .pipe(cssnano())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./css'));

    return merge(pipe1, pipe2);
});


// Run:
// gulp sourcemaps + sass + reload(browserSync)
// Prepare the child-theme.css for the development environment
gulp.task('scss-for-dev', function() {
    gulp.src('./sass/*.scss')
        .pipe(plumber())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sass())
        .pipe(sourcemaps.write(undefined, { sourceRoot: null }))
        .pipe(gulp.dest('./css'))
});

gulp.task('watch-scss', ['browser-sync'], function () {
    gulp.watch('./sass/**/*.scss', ['scss-for-dev']);
});



// Run:
// gulp sass
// Compiles SCSS files in CSS
gulp.task('sass', function () {
    gulp.src('./sass/*.scss')
        .pipe(plumber())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sass())
        .pipe(sourcemaps.write(undefined, { sourceRoot: null }))
        .pipe(gulp.dest('./css'));
});


// Run:
// gulp watch
// Starts watcher. Watcher runs gulp sass task on changes
gulp.task('watch', function () {
    gulp.watch('./sass/**/*.scss', ['sass']);
    gulp.watch('./css/theme.css', ['cssnano']);
    gulp.watch([basePaths.dev + 'js/**/*.js'], ['scripts'])
});


// Run:
// gulp cssnano
// Minifies CSS files
gulp.task('cssnano', ['cleancss'], function(){
  return gulp.src('./css/theme.css')
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(plumber())
    .pipe(rename({suffix: '.min'}))
    .pipe(cssnano({discardComments: {removeAll: true}}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./css/'))
});

gulp.task('cleancss', function() {
  return gulp.src('./css/*.min.css', { read: false }) // much faster
    .pipe(ignore('theme.css'))
    .pipe(rimraf());
});


// Run:
// gulp browser-sync
// Starts browser-sync task for starting the server.
gulp.task('browser-sync', function() {
    browserSync.init(browserSyncWatchFiles, browserSyncOptions);
});


// Run:
// gulp watch-bs
// Starts watcher with browser-sync. Browser-sync reloads page automatically on your browser
gulp.task('watch-bs', ['browser-sync', 'watch', 'cssnano', 'scripts'], function () { });


// Run:
// gulp scripts.
// Uglifies and concat all JS files into one
gulp.task('scripts', function() {
    var scriptsVendors = [
        basePaths.dev + 'js/jquery/jquery.js', //add here bootstrap js if is necessary
        //basePaths.dev + 'js/bootstrap/alert.js'
    ];
    var scriptsProject = [
        basePaths.customjs + 'js/project_general.js' 
    ];
  gulp.src(scriptsVendors)
    .pipe(concat('vendors.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./js/'));

    gulp.src(scriptsProject)
      .pipe(concat('theme.js'))
      .pipe(babel())
      .pipe(gulp.dest('./js/'));

      gulp.src(scriptsProject)
        .pipe(concat('theme.min.js'))
        .pipe(babel())
        .pipe(uglify())
        .pipe(gulp.dest('./js/'));
});

// Copy all Bootstrap JS files
gulp.task('copy-assets', function() {

////////////////// All Bootstrap 4 Assets /////////////////////////
// Copy all Jquery JS files
    gulp.src(basePaths.node + 'jquery/dist/*.js')
       .pipe(gulp.dest(basePaths.dev + '/js/jquery'));

    gulp.src(basePaths.node + 'bootstrap/js/dist/*.js')
       .pipe(gulp.dest(basePaths.dev + '/js/bootstrap'));

    gulp.src(basePaths.node + 'bootstrap/scss/**/*.scss')
       .pipe(gulp.dest(basePaths.dev + '/scss/bootstrap'));

});


// Run
// gulp dist
// Copies the files to the /dist folder for distributon
gulp.task('dist', function() {
    gulp.src(['**/*','!bower_components','!bower_components/**','!node_modules','!node_modules/**','!src','!src/**','!dist','!dist/**', '*'])
    .pipe(gulp.dest('dist/'))
});

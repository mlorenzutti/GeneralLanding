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
    './dist/css/*.min.css',
    './dist/js/*.min.js',
    './app/**/*.nunjucks',
    './**/*.php'
];

// browser-sync options
// see: https://www.browsersync.io/docs/options/
var browserSyncOptions = {
    server: 'dist',
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
var nunjucksRender = require('gulp-nunjucks-render');
var data = require('gulp-data')


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
        .pipe(gulp.dest('./dist/css'));

    var pipe2 = source.pipe(clone())
        .pipe(cssnano())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./dist/css'));

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
        .pipe(gulp.dest('./dist/css'))
});

gulp.task('watch-scss', ['browser-sync'], function () {
    gulp.watch('./sass/**/*.scss', ['scss-for-dev']);
});


gulp.task('move-static', function(){
    gulp.src("static/**/**.*")
    .pipe(gulp.dest('dist/static'));
})


// Run:
// gulp sass
// Compiles SCSS files in CSS
gulp.task('sass', function () {
    gulp.src('./sass/*.scss')
        .pipe(plumber())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sass())
        .pipe(sourcemaps.write(undefined, { sourceRoot: null }))
        .pipe(gulp.dest('./dist/css'));
});


// Run:
// gulp watch
// Starts watcher. Watcher runs gulp sass task on changes
gulp.task('watch', function () {
    gulp.watch('./sass/**/*.scss', ['sass']);
    gulp.watch('./app/**/*.nunjucks', ['nunjucks']);
    gulp.watch('./dist/css/theme.css', ['cssnano']);
    gulp.watch([basePaths.customjs + '*.js'], ['scripts']);
    gulp.watch([basePaths.dev + 'js/**/*.js'], ['scripts'])
});


// Run:
// gulp cssnano
// Minifies CSS files
gulp.task('cssnano', ['cleancss'], function(){
  return gulp.src('./dist/css/theme.css')
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(plumber())
    .pipe(rename({suffix: '.min'}))
    .pipe(cssnano({discardComments: {removeAll: true}}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/css/'))
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
gulp.task('watch-bs', ['browser-sync', 'watch','move-static'], function () { });

gulp.task('build',['move-static','sass','nunjucks','scripts','cssnano'], function () { });


// Run:
// gulp scripts.
// Uglifies and concat all JS files into one
gulp.task('scripts', function() {
    var scriptsJquery = [
        basePaths.dev + 'js/jquery/jquery.js', //add here bootstrap js if is necessary
    ]
    var scriptsVendors = [
        basePaths.dev + 'js/bootstrap/util.js',
        basePaths.dev + 'js/bootstrap/collapse.js',
        basePaths.dev + 'js/bootstrap/modal.js',
        basePaths.dev + 'js/parsleyjs/parsley.js',
        basePaths.dev + 'js/typeahead/jquery.typeahead.min.js'
        //basePaths.dev + 'js/bootstrap/alert.js'
    ];
    var scriptsProject = [
        basePaths.customjs + 'project_general.js' 
    ];

  gulp.src(scriptsVendors)
    .pipe(concat('jquery.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./dist/js/'));

  gulp.src(scriptsVendors)
    .pipe(concat('vendors.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./dist/js/'));

    gulp.src(scriptsProject)
      .pipe(concat('theme.js'))
      .pipe(babel())
      .pipe(gulp.dest('./dist/js/'));

      gulp.src(scriptsProject)
        .pipe(concat('theme.min.js'))
        .pipe(babel())
        .pipe(uglify())
        .pipe(gulp.dest('./dist/js/'));
});

// Copy all Bootstrap JS files
gulp.task('copy-assets', function() {

////////////////// All Bootstrap 4 Assets /////////////////////////
// Copy all Jquery JS files
    gulp.src(basePaths.node + 'jquery/dist/*.js')
       .pipe(gulp.dest(basePaths.dev + '/js/jquery'));

    gulp.src(basePaths.node + 'bootstrap/js/dist/*.js')
       .pipe(gulp.dest(basePaths.dev + '/js/bootstrap'));

    gulp.src(basePaths.node + 'jquery-typeahead/dist/*.js')
       .pipe(gulp.dest(basePaths.dev + '/js/typeahead'));

    gulp.src(basePaths.node + 'parsleyjs/dist/*.js')
       .pipe(gulp.dest(basePaths.dev + '/js/parsleyjs'));

    gulp.src(basePaths.node + 'jquery-typeahead/src/*.scss')
       .pipe(gulp.dest(basePaths.dev + '/scss/typeahead'));

    gulp.src(basePaths.node + 'bootstrap/scss/**/*.scss')
       .pipe(gulp.dest(basePaths.dev + '/scss/bootstrap'));

});

gulp.task('nunjucks', function() {
    // nunjucks stuff here
    return gulp.src('app/pages/**/*.+(html|nunjucks)')
    // Renders template with nunjucks
    .pipe(data(function() {
        return require('./data.json')
      }))
    .pipe(nunjucksRender({
        path: ['app/templates']
      }))
    // output files in app folder
    .pipe(gulp.dest('dist'))
  });


// Run
// gulp dist
// Copies the files to the /dist folder for distributon
gulp.task('dist', function() {
    gulp.src(['**/*','!bower_components','!bower_components/**','!node_modules','!node_modules/**','!src','!src/**','!dist','!dist/**', '*'])
    .pipe(gulp.dest('dist/'))
});

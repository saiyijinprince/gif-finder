'use strict';
var gulp = require('gulp');
var gulpif = require('gulp-if');
var newer = require('gulp-newer');
var cache = require('gulp-cached');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var rev = require('gulp-rev');
var uglify = require('gulp-uglify');
var babel = require('gulp-babel');
var ngAnnotate = require('gulp-ng-annotate');
var sass = require('gulp-sass');
var mainBowerFiles = require('main-bower-files');
var argv = require('yargs').argv;
var es = require('event-stream');
var zip = require('gulp-zip');
var connect = require('gulp-connect');
var proxy = require('http-proxy-middleware');


var paths = {
    lintFiles: [
      'gulpfile.js',
      'src/**/ *.js',
      'test/**/*.spec.js'
    ],
    sourceFiles: [
        'src/**/*.js'
    ],

    testFiles:[
        'test/**/*.spec.js'
    ]
};

var config = {
    appName:'gif-finder',
    dest: 'dist',
    sourceRoot: 'src',
    isProduction: (process.env.GULP_ENV === 'production')
};

if (argv.production){
    process.env.NODE_ENV = 'production';
} else if (typeof process.env.NODE_ENV === 'undefined') {
    process.env.NODE_ENV = 'development';
}

gulp.task( 'connect', function() {
    connect.server( {
        root: 'dist',
        port: 9002,
        livereload: true,
        middleware: function() {
            return [
                proxy( '/services', {
                    target: '',
                    changeOrigin:true,
                    ws: true
                })
            ];
        }
    });
});

gulp.task( 'clean:docs', function( done ) {
    var del = require( 'del' );
    del([
        'docs/'
    ]);
    done();
});

gulp.task('clean:coverage', function (done) {
    var del = require('del');

    del([
        'coverage/'
    ]);
    done();
});

gulp.task( 'clean:dist', function( done ) {
   var del = require( 'del' );
    del([
        'dist/',
        'deploy.zip'
    ]);

    done();
});

gulp.task( 'jscs', function() {
   var jscs = require( 'gulp-jscs' );

    return gulp.src( paths.lintFiles )
        .pipe(jscs({fix:true}))
        .pipe(jscs.reporter())
        .pipe(jscs.reporter( 'fail' ));
});

gulp.task( 'jsdoc', gulp.series( 'clean:docs', function jsdoc() {
    var jsdocTool = require( 'gulp-jsdoc' );
    var jsdocConfig = JSON.parse( require( 'fs').readFileSync( '.jsdocrc '));

    return gulp.src( jsdocConfig.source.include)
        .pipe(jsdocTool(
            jsdocConfig.opts.destination,
            jsdocConfig.templates,
            jsdocConfig.opts
        ));
}));

gulp.task( 'jshint', function() {
   var jshint = require( 'gulp-jshint' );

    return gulp.src( paths.lintFiles )
        .pipe( jshint() )
        .pipe( jshint.reporter( 'jshint-stylish' ) )
        .pipe( jshint.reporter( 'fail' ) );
});

gulp.task( 'bower' , function() {
   return gulp.src( mainBowerFiles() )
       .pipe( gulp.dest( 'dist' ) );
});

gulp.task('inject', function () {
    var path = require('path');
    var cdnizer = require('gulp-cdnizer');
    var inject = require('gulp-inject');
    return gulp
        .src(['src/*.html'])
        .pipe(inject(gulp.src(mainBowerFiles(), {read: false}),
            {addRootSlash: false, relative: false, name: 'bower'}))
        .pipe(inject(gulp.src(['./*.js', './*.css'],
            {read: false, cwd: path.join(__dirname, '/dist')}), {addRootSlash: false}))
        /*
        .pipe(cdnizer({
            defaultCDNBase: '//cdn.factset.com',
            defaultCDN: '${defaultCDNBase}/${package}/${versionFull}/${filenameMin}',
            files: [
                {
                    file: 'bower_components/jquery/dist/jquery.min.js',
                    package: 'jquery',
                    test: 'window.jQuery'
                },
                {
                    file: 'bower_components/lodash/lodash.min.js',
                    package: 'lodash',
                    test: 'window._'
                },
                {
                    file: 'bower_components/thief/js/thief.min.js',
                    package: 'thief',
                    cdn: '${defaultCDNBase}/${package}/${versionFull}/js/${filenameMin}',
                    test: 'window.thief'
                },
                {
                    file: 'bower_components/thief/css/thief.min.css',
                    package: 'thief',
                    cdn: '${defaultCDNBase}/${package}/${versionFull}/css/${filenameMin}'
                },
                {
                    file: 'bower_components/angular/angular.min.js',
                    package: 'angular',
                    test: 'window.angular'
                },
                {
                    file: 'bower_components/thief-angular/js/thief-angular.min.js',
                    package: 'thief-angular',
                    cdn: '${defaultCDNBase}/${package}/${versionFull}/js/${filenameMin}'
                },
                {
                    file: 'bower_components/thief-angular/css/thief-angular.min.css',
                    package: 'thief-angular',
                    cdn: '${defaultCDNBase}/${package}/${versionFull}/thief-angular.git/css/${filenameMin}'
                },
                {
                    file: 'bower_components/slickgrid-angular/slickgrid-angular.min.js',
                    package: 'slickgrid-angular',
                    cdn: '${defaultCDNBase}/${package}/v${versionFull}/${filenameMin}'
                },
                {
                    file: 'bower_components/slickgrid-angular/slickgrid-angular.min.css',
                    package: 'slickgrid-angular',
                    cdn: '${defaultCDNBase}/${package}/v${versionFull}/${filenameMin}'
                }
            ]
        }))
        */
        .pipe(gulp.dest('./dist'));
});

function getTemplateCache() {
    var minifyHtml = require('gulp-minify-html');
    var templatecache = require('gulp-angular-templatecache');
    return gulp
        .src([config.sourceRoot + '/**/*.html'])
        .pipe(minifyHtml({
            empty: true,
            spare: true,
            quotes: true
        }))
        .pipe(templatecache('templateCacheHtml.js', {
            module: 'gif-finder',
            root: ''
        }));
}
/*
 * Task to concat and minify scripts
 */
gulp.task('scripts', function () {

    return es.merge([gulp.src([config.sourceRoot + '/app.js', config.sourceRoot + '/**/*.js']), getTemplateCache()])
        .pipe(newer('app.js'))
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(cache('app.js'))
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(ngAnnotate())
        .pipe(concat('app.js'))
        .pipe(gulpif(argv.production, uglify()))
        .pipe(rev())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(config.dest));
});
/*
 * Task to concat and minify CSS files
 */
gulp.task('styles', function () {
    var concatCss = require('gulp-concat-css');
    var minifyCss = require('gulp-minify-css');
    return gulp
        .src([config.sourceRoot + '/**/*.scss'])
        .pipe(newer('app.css'))
        .pipe(sourcemaps.init())
        .pipe(cache('app.css'))
        .pipe(sass({
            style: 'expanded'
        }))
        .pipe(concatCss('app.css'))
        .pipe(minifyCss())
        .pipe(rev())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(config.dest));
});

gulp.task('test:unit', function (cb) {
    require('karma').server.start({
        configFile: __dirname + '/karma.conf.js'
    }, function (err) {
        // hide errors in development mode, since we're continuous testing
        if (argv.production) {
            cb(err);
        }
        else {
            cb();
        }
    });
});

gulp.task('compress', function () {
    return gulp.src('dist/**')
        .pipe(zip('deploy.zip'))
        .pipe(gulp.dest('./'));
});

/*
 * Register aggregate tasks.
 */
gulp.task('clean', gulp.parallel('clean:docs', 'clean:coverage', 'clean:dist'));
gulp.task('lint', gulp.parallel('jshint', 'jscs'));
gulp.task('build', gulp.series( 'lint', 'clean', gulp.parallel('styles', 'scripts'), 'inject'));
gulp.task('test', gulp.parallel('test:unit'));
gulp.task('default', gulp.parallel('build', /*'test',*/ 'jsdoc'));
gulp.task('serve', gulp.series('build', 'bower', 'connect'));
gulp.task('deploy', gulp.series('default', 'bower', 'compress'));
gulp.task('release', gulp.series('build','jsdoc','bower', 'compress'));

/*
 * Watch for file changes to either source, or test, files, and execute the appropriate task(s) associated with the
 * changed file(s).
 */
gulp.task('watch', gulp.series('default', function () {
    var watch = require('gulp-watch');

    watch(paths.lintFiles, function () {
        gulp.start('lint');
    });

    watch(paths.sourceFiles.concat(paths.testFiles), function () {
        gulp.start('test');
    });

    //watch(paths.sourceFiles, function () {
    //    //gulp.start('jsdoc');
    //});
}));
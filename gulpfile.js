var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');

var paths = {
  scripts: [
      "./web/dist/assets/js/holder.js",
      "./web/dist/assets/lib/angular/angular.js",
      "./web/dist/assets/lib/angular/angular-route.js",
      "./web/dist/assets/lib/angular/angular-resource.js",
      "./web/dist/assets/js/app.js",
      "./web/dist/assets/js/controller.js",
      //"./web/dist/assets/js/resources.js",
      "./web/dist/assets/js/parallax.js",
      "./web/dist/assets/js/MathJax.js",

      "./web/dist/assets/js/d3.min.js",


      "./web/dist/assets/lib/codemirror/",
      "./web/dist/assets/lib/codemirror/codemirror.min.js",
      "./web/dist/assets/lib/codemirror/addon/runmode/runmode.js",
      "./web/dist/assets/lib/codemirror/mode/javascript/javascript.js",
      "./web/dist/assets/lib/codemirror/mode/sql/sql.js",
      "./web/dist/assets/lib/codemirror/mode/cypher/cypher.js",
      "./web/dist/assets/lib/codemirror/mode/xml/xml.js",
      "./web/dist/assets/lib/codemirror/mode/clike/clike.js",
      "./web/dist/assets/js/colorize.js",

      "./web/dist/assets/lib/twitter/widgets.js",
      "./web/dist/assets/js/social.js",
      "./web/dist/assets/js/ga.js",

      // Bootstrap core JavaScript

      // Placed at the end of the document so the pages load faster
      "./web/dist/assets/js/lodash.compat.min.js",
      "./web/dist/assets/js/jquery-2.0.3.min.js",
      "./web/dist/assets/js/jquery-ui-1.10.3.custom.min.js",
      "./web/dist/assets/js/application.js",
      "./web/dist/assets/lib/bootstrap/js/bootstrap.min.js",
      "./web/dist/assets/lib/owl-carousel/owl.carousel.min.js",
      "./web/dist/assets/js/google-code-prettify/prettify.js",
      "./web/dist/assets/js/jquery.dataTables.min.js",
      "./web/dist/assets/js/cypher.datatable.js",


      //"./web/dist/assets/js/opal.js",
      "./web/dist/assets/js/neod3.js",
      "./web/dist/assets/js/neod3-visualization.js",
      "./web/dist/assets/js/console.js",
      "./web/dist/assets/js/gist.js",
      "./web/dist/assets/js/dot.js",
      "./web/dist/assets/js/graphgist.js",
      "./web/dist/assets/js/base64.js",
      "./web/dist/assets/js/mutate.min.js",
      "./web/dist/assets/js/gist_search.js"
    ]
};

gulp.task('watch', function() {
  gulp.watch('./web/dist/assets/**/*', ['scripts']);
});

gulp.task('scripts', function() {
  require('child_process').exec('rm web/dist/assets/js/all*.js', function () {})
//  gulp.src(paths.scripts)
//    .pipe(sourcemaps.init())
//      .pipe(uglify())
//      .pipe(concat('all.min.withsourcemaps.js'))
//    .pipe(sourcemaps.write())
//    .pipe(gulp.dest('./web/dist/assets/js/'));

  gulp.src(paths.scripts)
      .pipe(uglify())
      .pipe(concat('all.min.js'))
    .pipe(gulp.dest('./web/dist/assets/js/'));

  gulp.src(paths.scripts)
    .pipe(concat('all.js'))
    .pipe(gulp.dest('./web/dist/assets/js/'));
});

gulp.task('default', ['scripts'])

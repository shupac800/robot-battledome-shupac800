var gulp = require('gulp');
var jshint = require('gulp-jshint');
var watch = require('gulp-watch');

gulp.task('watch', function() {
  gulp.watch('javascripts/**/*.js', ['hint']);
});

gulp.task('hint', function () {
    return gulp.src(['javascripts/*.js'])
        .pipe(jshint({esversion:6}))
        .pipe(jshint.reporter('jshint-stylish'));
});

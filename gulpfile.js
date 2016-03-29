const gulp = require('gulp');
const gulpsync = require('gulp-sync')(gulp);
const del = require('del');
const shell = require('gulp-shell');


gulp.task('clean', () => {
  return del(['scripts/**']);
});

// Copy over the coffeescript files from src directly.
gulp.task('coffee', ['clean'], () => {
  return gulp.src(
    '**/*.coffee',
    {base: "src"}
  ).pipe(gulp.dest('scripts'));
});

const gulp = require('gulp');
const gulpsync = require('gulp-sync')(gulp);
const del = require('del');
const shell = require('gulp-shell');


gulp.task('clean', () => {
  return del(['scripts/**']);
});

// Copy over the coffeescript files from src directly.
gulp.task('copy-coffee', () => {
  return gulp.src(
    '**/*.coffee',
    {base: "src"}
  ).pipe(gulp.dest('scripts'));
});

gulp.task('typescript', shell.task([
  'node_modules/typescript/bin/tsc'
]));


gulp.task('compile', gulpsync.sync(['copy-coffee', 'typescript']));
gulp.task('default', gulpsync.sync(['clean', 'compile']));
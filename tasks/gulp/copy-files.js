'use strict'

const gulp = require('gulp')
const taskArguments = require('./task-arguments')
const configPaths = require('../../config/paths.json')

const destination = taskArguments.destination

gulp.task('copy:assets', () => {
  if (destination === 'package/') {
    return gulp.src([configPaths.src + '/**/*', '!**/all.js'])
      .pipe(gulp.dest(destination + 'kbrinl/'))
  } else {
    return gulp.src(configPaths.src + 'assets/**/*')
      .pipe(gulp.dest(destination + 'assets/'))
  }
})

gulp.task('copy:readme', () => {
  return gulp.src('README.md')
    .pipe(gulp.dest(destination))
})

gulp.task('copy:package', gulp.series(
  'copy:assets',
  'copy:readme'
))

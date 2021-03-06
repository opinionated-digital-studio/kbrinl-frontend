'use strict'

const gulp = require('gulp')
const stylelint = require('gulp-stylelint')
const configPaths = require('../../config/paths.json')

gulp.task('lint:scss:fix', () => {
  return gulp.src(
    configPaths.src + '**/*.scss'
  )
    .pipe(stylelint({
      fix: true,
      failAfterError: true,
      reporters: [
        { formatter: 'string', console: true }
      ]
    }))
    .pipe(gulp.dest(configPaths.src))
})

gulp.task('lint:scss', () => {
  return gulp.src(
    configPaths.src + '**/*.scss'
  )
    .pipe(stylelint({
      failAfterError: true,
      reporters: [
        { formatter: 'string', console: true }
      ]
    }))
})

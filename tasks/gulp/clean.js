'use strict'

const gulp = require('gulp')
const del = require('del')
const taskArguments = require('./task-arguments')

gulp.task('clean', () => {
  return del([
    taskArguments.destination + '**/*', '!package/package*', '!package/README.md'
  ])
})

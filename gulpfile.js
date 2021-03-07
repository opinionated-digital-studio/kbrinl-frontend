'use strict'

const gulp = require('gulp')
require('./tasks/gulp/clean')
require('./tasks/gulp/compile-assets')
require('./tasks/gulp/nodemon')
require('./tasks/gulp/copy-files')
require('./tasks/gulp/lint')
require('./tasks/gulp/watch')
const taskArguments = require('./tasks/gulp/task-arguments')

const isPackageBuild = (taskArguments.destination === 'package/')

gulp.task('compile', gulp.series(
  'scss:compile',
  'js:compile'
))

gulp.task('serve', gulp.parallel(
  'watch',
  'nodemon'
))

gulp.task('copy-files', gulp.series(
  isPackageBuild ? 'copy:package' : 'copy:assets'
))

gulp.task('lint', gulp.series(
  'lint:scss'
))

gulp.task('build', gulp.series(
  'clean',
  'lint',
  'copy-files',
  'compile'
))

gulp.task('dev', gulp.series(
  'build',
  'serve'
))

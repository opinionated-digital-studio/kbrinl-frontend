'use strict'

const gulp = require('gulp')
const configPaths = require('../../config/paths.json')

gulp.task('watch', () => {
  gulp.watch([configPaths.src + '**/**/*.scss', configPaths.src + '**/**/*.js', configPaths.app + '**/**/*.scss', configPaths.app + '**/**/*.yaml'], gulp.series('lint', 'compile'))
})

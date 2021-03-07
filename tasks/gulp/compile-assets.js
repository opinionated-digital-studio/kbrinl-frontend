'use strict'

const gulp = require('gulp')
const sass = require('gulp-sass')
const rename = require('gulp-rename')
const postcss = require('gulp-postcss')
const postcssNormalize = require('postcss-normalize')
const autoprefixer = require('autoprefixer')
const cssnano = require('cssnano')
const rollup = require('gulp-better-rollup')
const uglify = require('gulp-uglify')
const gulpif = require('gulp-if')
const packageImporter = require('node-sass-package-importer')
const configPaths = require('../../config/paths.json')
const taskArguments = require('./task-arguments')
sass.compiler = require('node-sass')

const isPackageBuild = (taskArguments.destination === 'package/')
const destination = isPackageBuild ? 'package/kbrinl/' : taskArguments.destination

gulp.task('js:compile', () => {
  const outputName = taskArguments.destination === 'public/' ? 'app' : 'kbrinl-frontend'
  return gulp.src(configPaths.src + 'all.js')

    .pipe(rollup({
      // Used to set the `window` global and UMD/AMD export name.
      name: 'KBRINLFrontend',
      // Legacy mode is required for IE8 support
      legacy: true,
      // UMD allows the published bundle to work in CommonJS and in the browser.
      format: 'umd'
    }))
    .pipe(gulpif(!isPackageBuild, uglify()))
    .pipe(gulpif(!isPackageBuild, rename({
      basename: outputName,
      extname: '.min.js'
    })))
    .pipe(gulp.dest(destination))
})

gulp.task('scss:compile', () => {
  if (taskArguments.destination === 'package/') return gulp.src('.')
  const source = taskArguments.destination === 'public/' ? configPaths.app + 'assets/scss/app.scss' : configPaths.src + 'all.scss'
  const outputName = taskArguments.destination === 'public/' ? 'app' : 'kbrinl-frontend'

  return gulp.src(source)
    .pipe(sass({
      importer: packageImporter()
    }).on('error', sass.logError))
    .pipe(postcss([
      postcssNormalize({ forceImport: true }),
      autoprefixer(),
      cssnano
    ]))
    .pipe(rename({
      basename: outputName,
      extname: '.min.css'
    }))
    .pipe(gulp.dest(destination))
})

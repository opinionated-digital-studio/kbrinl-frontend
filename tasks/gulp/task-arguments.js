'use strict'

const argv = require('yargs').argv
const configPaths = require('../../config/paths.json')
const destination = argv.destination ? argv.destination + '/' : configPaths.public

exports.destination = destination

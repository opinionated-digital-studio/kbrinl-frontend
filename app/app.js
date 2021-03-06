const express = require('express')
const bodyParser = require('body-parser')
const nunjucks = require('nunjucks')
const util = require('util')
const fs = require('fs')
const path = require('path')
const readdir = util.promisify(fs.readdir)
const helperFunctions = require('../lib/helper-functions')
const fileHelper = require('../lib/file-helper')
const configPaths = require('../config/paths.json')

const app = express()

module.exports = (options) => {
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))

  const env = nunjucks.configure([configPaths.views, configPaths.pages, configPaths.layouts, configPaths.src, configPaths.components], {
    autoescape: true,
    express: app,
    noCache: true, // never use a cache and recompile templates each time
    trimBlocks: true, // automatically remove trailing newlines from a block/tag
    lstripBlocks: true, // automatically remove leading whitespace from a block/tag
    watch: true // reload templates when they are changed. needs chokidar dependency to be installed
  })

  // make the function available as a filter for all templates
  env.addFilter('componentNameToMacroName', helperFunctions.componentNameToMacroName)

  app.set('view engine', 'njk')
  app.use('/assets', express.static(configPaths.public + 'assets'))
  app.use('/public', express.static(configPaths.public))

  app.use((req, res, next) => {
    res.locals.siteTitle = 'Indonesia.nl Component Library'
    res.locals.header = {
      productName: 'Component Library',
      navigation: [{
        href: '/get-started',
        text: 'Get started'
      },
      {
        href: '/components',
        text: 'Components'
      }]
    }
    res.locals.footer = {
      heading: 'About this website',
      navigation: [{
        text: 'Privacy'
      },
      {
        text: 'Disclaimer'
      },
      {
        text: 'Colophon'
      }]
    }

    next()
  })

  app.get('/', (req, res) => {
    res.render('index.njk', {
      pageTitle: 'Home'
    })
  })

  app.get('/components', (req, res) => {
    const components = fileHelper.allComponents
    const siblings = components.map(component => {
      return {
        pageTitle: component.replace('-', ' ').replace(/^\w/, (c) => c.toUpperCase()),
        href: '/components/' + component
      }
    })

    res.render('components.njk', {
      pageTitle: 'Components',
      siblings
    })
  })

  // Whenever the route includes a :component parameter, read the component data
  // from its YAML file
  app.param('component', function (req, res, next, componentName) {
    res.locals.componentData = fileHelper.getComponentData(componentName)
    next()
  })

  // Component 'README' page
  app.get('/components/:component', function (req, res, next) {
    // make variables available to nunjucks template
    res.locals.componentPath = req.params.component
    const components = fileHelper.allComponents.map(component => {
      return {
        pageTitle: component.replace('-', ' ').replace(/^\w/, (c) => c.toUpperCase()),
        href: '/components/' + component,
        active: (req.params.component === component)
      }
    })
    res.render('component', function (error, html) {
      if (error) {
        next(error)
      } else {
        res.send(html)
      }
    })
  })

  // Component example preview
  app.get('/components/:component/:example*?/preview', function (req, res, next) {
    // Find the data for the specified example (or the default example)
    const componentName = req.params.component
    const requestedExampleName = req.params.example || 'default'

    const previewLayout = res.locals.componentData.previewLayout || '_iframe-layout'

    const exampleConfig = res.locals.componentData.examples.find(
      example => example.name.replace(/ /g, '-') === requestedExampleName
    )

    if (!exampleConfig) {
      next()
    }

    // Construct and evaluate the component with the data for this example
    const macroName = helperFunctions.componentNameToMacroName(componentName)
    const macroParameters = JSON.stringify(exampleConfig.data, null, '\t')

    res.locals.componentView = env.renderString(
      `{% from '${componentName}/macro.njk' import ${macroName} %}
      {{ ${macroName}(${macroParameters}) }}`
    )

    let bodyClasses = ''
    if (req.query.iframe) {
      bodyClasses = 'app-iframe-in-component-preview'
    }

    res.render('component-preview', { bodyClasses, previewLayout, pageTitle: componentName.replace('-', '') })
  })

  return app
}

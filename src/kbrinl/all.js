import Button from './components/button/button'
import Checkboxes from './components/checkboxes/checkboxes'
import Details from './components/details/details'
import Header from './components/header/header'
import Radios from './components/radios/radios'
import { nodeListForEach } from './common'

function initAll (options) {
  // Set the options to an empty object by default if no options are passed.
  options = typeof options !== 'undefined' ? options : {}

  // Allow the user to initialise KBRINL Frontend in only certain sections of the page
  // Defaults to the entire document if nothing is set.
  const scope = typeof options.scope !== 'undefined' ? options.scope : document

  const $button = scope.querySelectorAll('[data-module="kbrinl-button"]')
  nodeListForEach($button, function ($button) {
    new Button($button).init()
  })

  const $details = scope.querySelectorAll('[data-module="kbrinl-details"]')
  nodeListForEach($details, function ($detail) {
    new Details($detail).init()
  })

  const $header = scope.querySelector('[data-module="kbrinl-header"]')
  new Header($header).init()

  const $checkboxes = scope.querySelectorAll('[data-module="kbrinl-checkboxes"]')
  nodeListForEach($checkboxes, function ($checkbox) {
    new Checkboxes($checkbox).init()
  })

  const $radios = scope.querySelectorAll('[data-module="kbrinl-radios"]')
  nodeListForEach($radios, function ($radio) {
    new Radios($radio).init()
  })
}

export { initAll }

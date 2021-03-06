import { nodeListForEach } from '../../common'

class Checkboxes {
  constructor ($module) {
    this.$module = $module
    this.$inputs = $module.querySelectorAll('input[type="checkbox"]')
  }

  /**
   * Initialise Checkboxes
   *
   * Checkboxes can be associated with a 'conditionally revealed' content block –
   * for example, a checkbox for 'Phone' could reveal an additional form field for
   * the user to enter their phone number.
   *
   * These associations are made using a `data-aria-controls` attribute, which is
   * promoted to an aria-controls attribute during initialisation.
   *
   * We also need to restore the state of any conditional reveals on the page (for
   * example if the user has navigated back), and set up event handlers to keep
   * the reveal in sync with the checkbox state.
   */

  init () {
    const $module = this.$module
    const $inputs = this.$inputs

    nodeListForEach($inputs, function ($input) {
      const target = $input.getAttribute('data-aria-controls')

      // Skip checkboxes without data-aria-controls attributes, or where the
      // target element does not exist.
      if (!target || !$module.querySelector('#' + target)) {
        return
      }

      // Promote the data-aria-controls attribute to a aria-controls attribute
      // so that the relationship is exposed in the AOM
      $input.setAttribute('aria-controls', target)
      $input.removeAttribute('data-aria-controls')
    })

    // When the page is restored after navigating 'back' in some browsers the
    // state of form controls is not restored until *after* the DOMContentLoaded
    // event is fired, so we need to sync after the pageshow event in browsers
    // that support it.
    if ('onpageshow' in window) {
      window.addEventListener('pageshow', this._syncAllConditionalReveals.bind(this))
    } else {
      window.addEventListener('DOMContentLoaded', this._syncAllConditionalReveals.bind(this))
    }

    // Although we've set up handlers to sync state on the pageshow or
    // DOMContentLoaded event, init could be called after those events have fired,
    // for example if they are added to the page dynamically, so sync now too.
    this._syncAllConditionalReveals()

    $module.addEventListener('click', this._handleClick.bind(this))
  }

  /**
   * Sync the conditional reveal states for all inputs in this $module.
   */
  _syncAllConditionalReveals () {
    nodeListForEach(this.$inputs, this._syncConditionalRevealWithInputState.bind(this))
  }

  /**
 * Sync conditional reveal with the input state
 *
 * Synchronise the visibility of the conditional reveal, and its accessible
 * state, with the input's checked state.
 *
 * @param {HTMLInputElement} $input Checkbox input
 */
  _syncConditionalRevealWithInputState ($input) {
    const $target = this.$module.querySelector('#' + $input.getAttribute('aria-controls'))

    if ($target && $target.classList.contains('kbrinl-checkboxes__conditional')) {
      const inputIsChecked = $input.checked

      $input.setAttribute('aria-expanded', inputIsChecked)
      $target.classList.toggle('kbrinl-checkboxes__conditional--hidden', !inputIsChecked)
    }
  }

  /**
 * Click event handler
 *
 * Handle a click within the $module – if the click occurred on a checkbox, sync
 * the state of any associated conditional reveal with the checkbox state.
 *
 * @param {MouseEvent} event Click event
 */
  _handleClick (event) {
    const $target = event.target

    // If a checkbox with aria-controls, handle click
    const isCheckbox = $target.getAttribute('type') === 'checkbox'
    const hasAriaControls = $target.getAttribute('aria-controls')
    if (isCheckbox && hasAriaControls) {
      this._syncConditionalRevealWithInputState($target)
    }
  }
}

export default Checkboxes

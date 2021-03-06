const KEY_SPACE = 32
const DEBOUNCE_TIMEOUT_IN_SECONDS = 1

class Button {
  constructor ($module) {
    this.$module = $module
  }

  init () {
    if (!this.$module) {
      return
    }

    this.$module.addEventListener('keydown', this._handleKeyDown)
    this.$module.addEventListener('click', this._debounce)
  }

  /**
  * JavaScript 'shim' to trigger the click event of element(s) when the space key is pressed.
  *
  * Created since some Assistive Technologies (for example some Screenreaders)
  * will tell a user to press space on a 'button', so this functionality needs to be shimmed
  * See https://github.com/alphagov/kbrinl_elements/pull/272#issuecomment-233028270
  *
  * @param {object} event event
  */

  _handleKeyDown (event) {
  // get the target element
    const target = event.target
    // if the element has a role='button' and the pressed key is a space, we'll simulate a click
    if (target.getAttribute('role') === 'button' && event.keyCode === KEY_SPACE) {
      event.preventDefault()
      // trigger the target's click event
      target.click()
    }
  }

  /**
  * If the click quickly succeeds a previous click then nothing will happen.
  * This stops people accidentally causing multiple form submissions by
  * double clicking buttons.
  */

  _debounce (event) {
    const target = event.target
    // Check the button that is clicked on has the preventDoubleClick feature enabled
    if (target.getAttribute('data-prevent-double-click') !== 'true') {
      return
    }

    // If the timer is still running then we want to prevent the click from submitting the form
    if (this.debounceFormSubmitTimer) {
      event.preventDefault()
      return false
    }

    this.debounceFormSubmitTimer = setTimeout(function () {
      this.debounceFormSubmitTimer = null
    }.bind(this), DEBOUNCE_TIMEOUT_IN_SECONDS * 1000)
  }
}

export default Button

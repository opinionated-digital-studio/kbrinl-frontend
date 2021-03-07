(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define('KBRINLFrontend', ['exports'], factory) :
	(factory((global.KBRINLFrontend = {})));
}(this, (function (exports) { 'use strict';

const KEY_SPACE = 32;
const DEBOUNCE_TIMEOUT_IN_SECONDS = 1;

class Button {
  constructor ($module) {
    this.$module = $module;
  }

  init () {
    if (!this.$module) {
      return
    }

    this.$module.addEventListener('keydown', this._handleKeyDown);
    this.$module.addEventListener('click', this._debounce);
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
    const target = event.target;
    // if the element has a role='button' and the pressed key is a space, we'll simulate a click
    if (target.getAttribute('role') === 'button' && event.keyCode === KEY_SPACE) {
      event.preventDefault();
      // trigger the target's click event
      target.click();
    }
  }

  /**
  * If the click quickly succeeds a previous click then nothing will happen.
  * This stops people accidentally causing multiple form submissions by
  * double clicking buttons.
  */

  _debounce (event) {
    const target = event.target;
    // Check the button that is clicked on has the preventDoubleClick feature enabled
    if (target.getAttribute('data-prevent-double-click') !== 'true') {
      return
    }

    // If the timer is still running then we want to prevent the click from submitting the form
    if (this.debounceFormSubmitTimer) {
      event.preventDefault();
      return false
    }

    this.debounceFormSubmitTimer = setTimeout(function () {
      this.debounceFormSubmitTimer = null;
    }.bind(this), DEBOUNCE_TIMEOUT_IN_SECONDS * 1000);
  }
}

function nodeListForEach (nodes, callback) {
  if (window.NodeList.prototype.forEach) {
    return nodes.forEach(callback)
  }
  for (let i = 0; i < nodes.length; i++) {
    callback.call(window, nodes[i], i, nodes);
  }
}

class Checkboxes {
  constructor ($module) {
    this.$module = $module;
    this.$inputs = $module.querySelectorAll('input[type="checkbox"]');
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
    const $module = this.$module;
    const $inputs = this.$inputs;

    nodeListForEach($inputs, function ($input) {
      const target = $input.getAttribute('data-aria-controls');

      // Skip checkboxes without data-aria-controls attributes, or where the
      // target element does not exist.
      if (!target || !$module.querySelector('#' + target)) {
        return
      }

      // Promote the data-aria-controls attribute to a aria-controls attribute
      // so that the relationship is exposed in the AOM
      $input.setAttribute('aria-controls', target);
      $input.removeAttribute('data-aria-controls');
    });

    // When the page is restored after navigating 'back' in some browsers the
    // state of form controls is not restored until *after* the DOMContentLoaded
    // event is fired, so we need to sync after the pageshow event in browsers
    // that support it.
    if ('onpageshow' in window) {
      window.addEventListener('pageshow', this._syncAllConditionalReveals.bind(this));
    } else {
      window.addEventListener('DOMContentLoaded', this._syncAllConditionalReveals.bind(this));
    }

    // Although we've set up handlers to sync state on the pageshow or
    // DOMContentLoaded event, init could be called after those events have fired,
    // for example if they are added to the page dynamically, so sync now too.
    this._syncAllConditionalReveals();

    $module.addEventListener('click', this._handleClick.bind(this));
  }

  /**
   * Sync the conditional reveal states for all inputs in this $module.
   */
  _syncAllConditionalReveals () {
    nodeListForEach(this.$inputs, this._syncConditionalRevealWithInputState.bind(this));
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
    const $target = this.$module.querySelector('#' + $input.getAttribute('aria-controls'));

    if ($target && $target.classList.contains('kbrinl-checkboxes__conditional')) {
      const inputIsChecked = $input.checked;

      $input.setAttribute('aria-expanded', inputIsChecked);
      $target.classList.toggle('kbrinl-checkboxes__conditional--hidden', !inputIsChecked);
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
    const $target = event.target;

    // If a checkbox with aria-controls, handle click
    const isCheckbox = $target.getAttribute('type') === 'checkbox';
    const hasAriaControls = $target.getAttribute('aria-controls');
    if (isCheckbox && hasAriaControls) {
      this._syncConditionalRevealWithInputState($target);
    }
  }
}

const KEY_ENTER = 13;
const KEY_SPACE$1 = 32;

class Details {
  constructor ($module) {
    this.$module = $module;
  }

  init () {
    console.log('dsa');
    if (!this.module) {
      return
    }

    // If there is native details support, we want to avoid running code to polyfill native behaviour.
    const hasNativeDetails = typeof this.$module.open === 'boolean';

    if (hasNativeDetails) {
      return
    }

    this._polyfillDetails();
  }

  _polyfillDetails () {
    const $module = this.module;
    // Save shortcuts to the inner summary and content elements
    const $summary = this.$summary = $module.getElementsByTagName('summary').item(0);
    const $content = this.$content = $module.getElementsByTagName('div').item(0);

    // If <details> doesn't have a <summary> and a <div> representing the content
    // it means the required HTML structure is not met so the script will stop
    if (!$summary || !$content) {
      return
    }

    // If the content doesn't have an ID, assign it one now
    // which we'll need for the summary's aria-controls assignment
    if (!$content.id) {
      return
    }

    // Add ARIA role="group" to details
    $module.setAttribute('role', 'group');

    // Add role=button to summary
    $summary.setAttribute('role', 'button');

    // Add aria-controls
    $summary.setAttribute('aria-controls', $content.id);

    // Set tabIndex so the summary is keyboard accessible for non-native elements
    //
    // We have to use the camelcase `tabIndex` property as there is a bug in IE6/IE7 when we set the correct attribute lowercase:
    // See http://web.archive.org/web/20170120194036/http://www.saliences.com/browserBugs/tabIndex.html for more information.
    $summary.tabIndex = 0;

    // Detect initial open state
    const openAttr = $module.getAttribute('open') !== null;
    if (openAttr === true) {
      $summary.setAttribute('aria-expanded', 'true');
      $content.setAttribute('aria-hidden', 'false');
    } else {
      $summary.setAttribute('aria-expanded', 'false');
      $content.setAttribute('aria-hidden', 'true');
      $content.style.display = 'none';
    }

    // Bind an event to handle summary elements
    this._polyfillHandleInputs($summary, this._polyfillSetAttributes.bind(this));
  }

  /**
* Define a statechange function that updates aria-expanded and style.display
* @param {object} summary element
*/
  _polyfillSetAttributes () {
    const $module = this.$module;
    const $summary = this.$summary;
    const $content = this.$content;

    const expanded = $summary.getAttribute('aria-expanded') === 'true';
    const hidden = $content.getAttribute('aria-hidden') === 'true';

    $summary.setAttribute('aria-expanded', (expanded ? 'false' : 'true'));
    $content.setAttribute('aria-hidden', (hidden ? 'false' : 'true'));

    $content.style.display = (expanded ? 'none' : '');

    const hasOpenAttr = $module.getAttribute('open') !== null;
    if (!hasOpenAttr) {
      $module.setAttribute('open', 'open');
    } else {
      $module.removeAttribute('open');
    }

    return true
  }

  /**
* Handle cross-modal click events
* @param {object} node element
* @param {function} callback function
*/
  _polyfillHandleInputs (node, callback) {
    node.addEventListener('keypress', function (event) {
      const target = event.target;
      // When the key gets pressed - check if it is enter or space
      if (event.keyCode === KEY_ENTER || event.keyCode === KEY_SPACE$1) {
        if (target.nodeName.toLowerCase() === 'summary') {
        // Prevent space from scrolling the page
        // and enter from submitting a form
          event.preventDefault();
          // Click to let the click event do all the necessary action
          if (target.click) {
            target.click();
          } else {
          // except Safari 5.1 and under don't support .click() here
            callback(event);
          }
        }
      }
    });

    // Prevent keyup to prevent clicking twice in Firefox when using space key
    node.addEventListener('keyup', function (event) {
      const target = event.target;
      if (event.keyCode === KEY_SPACE$1) {
        if (target.nodeName.toLowerCase() === 'summary') {
          event.preventDefault();
        }
      }
    });

    node.addEventListener('click', callback);
  }
}

class ErrorSummary {
  constructor ($module) {
    this.$module = $module;
  }

  init () {
    const $module = this.$module;
    if (!$module) {
      return
    }
    $module.focus();

    $module.addEventListener('click', this._handleClick.bind(this));
  }

  /**
  * Click event handler
  *
  * @param {MouseEvent} event - Click event
  */
  _handleClick (event) {
    const target = event.target;
    if (this._focusTarget(target)) {
      event.preventDefault();
    }
  }

  /**
   * Focus the target element
   *
   * By default, the browser will scroll the target into view. Because our labels
   * or legends appear above the input, this means the user will be presented with
   * an input without any context, as the label or legend will be off the top of
   * the screen.
   *
   * Manually handling the click event, scrolling the question into view and then
   * focussing the element solves this.
   *
   * This also results in the label and/or legend being announced correctly in
   * NVDA (as tested in 2018.3.2) - without this only the field type is announced
   * (e.g. "Edit, has autocomplete").
   *
   * @param {HTMLElement} $target - Event target
   * @returns {boolean} True if the target was able to be focussed
   */

  _focusTarget ($target) {
    if ($target.tagName !== 'A' || $target.href === false) {
      return false
    }

    const inputId = this._getFragmentFromUrl($target.href);
    const $input = document.getElementById(inputId);
    if (!$input) {
      return false
    }

    const $legendOrLabel = this._getAssociatedLegendOrLabel($input);
    if (!$legendOrLabel) {
      return false
    }

    // Scroll the legend or label into view *before* calling focus on the input to
    // avoid extra scrolling in browsers that don't support `preventScroll` (which
    // at time of writing is most of them...)
    $legendOrLabel.szrollIntoView();
    $input.focus({ preventScroll: true });

    return true
  }

  /**
   * Get fragment from URL
   *
   * Extract the fragment (everything after the hash) from a URL, but not including
   * the hash.
   *
   * @param {string} url - URL
   * @returns {string} Fragment from URL, without the hash
   */

  _getFragmentFromUrl (url) {
    if (url.indexOf('#') === -1) {
      return false
    }

    return url.split('#').pop()
  }

  /**
 * Get associated legend or label
 *
 * Returns the first element that exists from this list:
 *
 * - The `<legend>` associated with the closest `<fieldset>` ancestor, as long
 *   as the top of it is no more than half a viewport height away from the
 *   bottom of the input
 * - The first `<label>` that is associated with the input using for="inputId"
 * - The closest parent `<label>`
 *
 * @param {HTMLElement} $input - The input
 * @returns {HTMLElement} Associated legend or label, or null if no associated
 *                        legend or label can be found
 */

  _getAssociatedLegendOrLabel ($input) {
    const $fieldset = $input.closest('fieldset');

    if ($fieldset) {
      const legends = $fieldset.getElementsByTagName('legend');

      if (legends.length) {
        const $candidateLegend = legends[0];

        // If the input type is radio or checkbox, always use the legend if there
        // is one.
        if ($input.type === 'checkbox' || $input.type === 'radio') {
          return $candidateLegend
        }

        // For other input types, only scroll to the fieldset’s legend (instead of
        // the label associated with the input) if the input would end up in the
        // top half of the screen.
        //
        // This should avoid situations where the input either ends up off the
        // screen, or obscured by a software keyboard.
        const legendTop = $candidateLegend.getBoundingClientRect().top;
        const inputRect = $input.getBoundingClientRect();

        // If the browser doesn't support Element.getBoundingClientRect().height
        // or window.innerHeight (like IE8), bail and just link to the label.
        if (inputRect.height && window.innerHeight) {
          const inputBottom = inputRect.top + inputRect.height;

          if (inputBottom - legendTop < window.innerHeight / 2) {
            return $candidateLegend
          }
        }
      }
    }

    return document.querySelector("label[for='" + $input.getAttribute('id') + "']") ||
    $input.closest('label')
  }
}

class Header {
  constructor ($module) {
    this.$module = $module;
    this.$menuButton = $module && $module.querySelector('.kbrinl-js-header-toggle');
    this.$menu = this.$menuButton && $module.querySelector(
      '#' + this.$menuButton.getAttribute('aria-controls'));
  }

  init () {
    if (!this.$module || !this.$menuButton || !this.$menu) {
      return false
    }

    this._syncState(this.$menu.classList.contains('kbrinl-header__navigation--open'));
    this.$menuButton.addEventListener('click', this._handleMenuButtonClick.bind(this));
  }

  _syncState (isVisible) {
    this.$menuButton.classList.toggle('kbrinl-header__menu-button--open', isVisible);
    this.$menuButton.setAttribute('aria-expanded', isVisible);
  }

  _handleMenuButtonClick () {
    const isVisible = this.$menu.classList.toggle('kbrinl-header__navigation--open');
    this._syncState(isVisible);
  }
}

class Radios {
  constructor ($module) {
    this.$module = $module;
    this.$inputs = $module.querySelectorAll('input[type="radio"]');
  }

  /**
 * Initialise Radios
 *
 * Radios can be associated with a 'conditionally revealed' content block – for
 * example, a radio for 'Phone' could reveal an additional form field for the
 * user to enter their phone number.
 *
 * These associations are made using a `data-aria-controls` attribute, which is
 * promoted to an aria-controls attribute during initialisation.
 *
 * We also need to restore the state of any conditional reveals on the page (for
 * example if the user has navigated back), and set up event handlers to keep
 * the reveal in sync with the radio state.
 */
  init () {
    const $module = this.$module;
    const $inputs = this.$inputs;

    nodeListForEach($inputs, function ($input) {
      const target = $input.getAttribute('data-aria-controls');

      // Skip radios without data-aria-controls attributes, or where the
      // target element does not exist.
      if (!target || !$module.querySelector('#' + target)) {
        return
      }

      // Promote the data-aria-controls attribute to a aria-controls attribute
      // so that the relationship is exposed in the AOM
      $input.setAttribute('aria-controls', target);
      $input.removeAttribute('data-aria-controls');
    });

    // When the page is restored after navigating 'back' in some browsers the
    // state of form controls is not restored until *after* the DOMContentLoaded
    // event is fired, so we need to sync after the pageshow event in browsers
    // that support it.
    if ('onpageshow' in window) {
      window.addEventListener('pageshow', this._syncAllConditionalReveals.bind(this));
    } else {
      window.addEventListener('DOMContentLoaded', this._syncAllConditionalReveals.bind(this));
    }

    // Although we've set up handlers to sync state on the pageshow or
    // DOMContentLoaded event, init could be called after those events have fired,
    // for example if they are added to the page dynamically, so sync now too.
    this._syncAllConditionalReveals();

    // Handle events
    $module.addEventListener('click', this._handleClick.bind(this));
  }

  /**
 * Sync the conditional reveal states for all inputs in this $module.
 */
  _syncAllConditionalReveals () {
    nodeListForEach(this.$inputs, this._syncConditionalRevealWithInputState.bind(this));
  }

  /**
 * Sync conditional reveal with the input state
 *
 * Synchronise the visibility of the conditional reveal, and its accessible
 * state, with the input's checked state.
 *
 * @param {HTMLInputElement} $input Radio input
 */
  _syncConditionalRevealWithInputState ($input) {
    const $target = document.querySelector('#' + $input.getAttribute('aria-controls'));

    if ($target && $target.classList.contains('kbrinl-radios__conditional')) {
      const inputIsChecked = $input.checked;

      $input.setAttribute('aria-expanded', inputIsChecked);
      $target.classList.toggle('kbrinl-radios__conditional--hidden', !inputIsChecked);
    }
  }

  /**
 * Click event handler
 *
 * Handle a click within the $module – if the click occurred on a radio, sync
 * the state of the conditional reveal for all radio buttons in the same form
 * with the same name (because checking one radio could have un-checked a radio
 * in another $module)
 *
 * @param {MouseEvent} event Click event
 */
  _handleClick (event) {
    const $clickedInput = event.target;

    // Ignore clicks on things that aren't radio buttons
    if ($clickedInput.type !== 'radio') {
      return
    }

    // We only need to consider radios with conditional reveals, which will have
    // aria-controls attributes.
    const $allInputs = document.querySelectorAll('input[type="radio"][aria-controls]');

    nodeListForEach($allInputs, function ($input) {
      const hasSameFormOwner = ($input.form === $clickedInput.form);
      const hasSameName = ($input.name === $clickedInput.name);

      if (hasSameName && hasSameFormOwner) {
        this._syncConditionalRevealWithInputState($input);
      }
    }.bind(this));
  }
}

function initAll (options) {
  // Set the options to an empty object by default if no options are passed.
  options = typeof options !== 'undefined' ? options : {};

  // Allow the user to initialise KBRINL Frontend in only certain sections of the page
  // Defaults to the entire document if nothing is set.
  const scope = typeof options.scope !== 'undefined' ? options.scope : document;

  const $button = scope.querySelectorAll('[data-module="kbrinl-button"]');
  nodeListForEach($button, function ($button) {
    new Button($button).init();
  });

  const $details = scope.querySelectorAll('[data-module="kbrinl-details"]');
  nodeListForEach($details, function ($detail) {
    new Details($detail).init();
  });

  // Find first error summary module to enhance.
  const $errorSummary = scope.querySelector('[data-module="kbrinl-error-summary"]');
  new ErrorSummary($errorSummary).init();

  const $header = scope.querySelector('[data-module="kbrinl-header"]');
  new Header($header).init();

  const $checkboxes = scope.querySelectorAll('[data-module="kbrinl-checkboxes"]');
  nodeListForEach($checkboxes, function ($checkbox) {
    new Checkboxes($checkbox).init();
  });

  const $radios = scope.querySelectorAll('[data-module="kbrinl-radios"]');
  nodeListForEach($radios, function ($radio) {
    new Radios($radio).init();
  });
}

exports.initAll = initAll;

})));

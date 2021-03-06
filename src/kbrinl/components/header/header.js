class Header {
  constructor ($module) {
    this.$module = $module
    this.$menuButton = $module && $module.querySelector('.kbrinl-js-header-toggle')
    this.$menu = this.$menuButton && $module.querySelector(
      '#' + this.$menuButton.getAttribute('aria-controls'))
  }

  init () {
    if (!this.$module || !this.$menuButton || !this.$menu) {
      return false
    }

    this._syncState(this.$menu.classList.contains('kbrinl-header__navigation--open'))
    this.$menuButton.addEventListener('click', this._handleMenuButtonClick.bind(this))
  }

  _syncState (isVisible) {
    this.$menuButton.classList.toggle('kbrinl-header__menu-button--open', isVisible)
    this.$menuButton.setAttribute('aria-expanded', isVisible)
  }

  _handleMenuButtonClick () {
    const isVisible = this.$menu.classList.toggle('kbrinl-header__navigation--open')
    this._syncState(isVisible)
  }
}

export default Header

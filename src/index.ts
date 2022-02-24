/**
 * @file Entry file.
 */

import isTouchDevice from 'is-touch-device'
import App from './containers/App'
import { mount } from './utils/dom'

if (process.env.NODE_ENV === 'development' || __APP_CONFIG__.enableDebugInProduction === true) {
  window.localStorage.debug = 'app*,profiler*'
}

// Detect touch device.
if (isTouchDevice()) {
  document.documentElement.classList.add('touch')
}

mount(App)

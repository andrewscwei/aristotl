/**
 * @file Utility functions for DOM-related operations.
 */

import React, { ComponentType } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter, BrowserRouterProps } from 'react-router-dom'
import { ThemeProvider, createGlobalStyle } from 'styled-components'
import createStore from '../store'
import globalStyle from '../styles/global'
import * as theme from '../styles/theme'
import { I18nRouterProvider } from './i18n'

/**
 * Factory function for generating base React app markup.
 *
 * @param Component The React component to wrap around.
 * @param options See {@link BrowserRouterProps}.
 *
 * @returns The JSX markup.
 */
export function markup(Component: ComponentType, options: BrowserRouterProps = {}) {
  const GlobalStyle = createGlobalStyle`
     ${globalStyle}
   `

  return (
    <>
      <GlobalStyle/>
      <Provider store={createStore()}>
        <ThemeProvider theme={theme}>
          <BrowserRouter {...options}>
            <I18nRouterProvider>
              <Component/>
            </I18nRouterProvider>
          </BrowserRouter>
        </ThemeProvider>
      </Provider>
    </>
  )
}

/**
 * Mounts a React component to a DOM element.

 * @param Component The React component to mount.
 * @param elementId The ID of the DOM element to mount the React component to.
 */
export function mount(Component: ComponentType, elementId = 'app') {
  const container = document.getElementById(elementId)
  if (!container) return console.warn(`No container with ID <${elementId}> found`)

  document.getElementById(elementId)

  createRoot(container).render(markup(Component))
}

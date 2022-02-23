import { normalize } from 'promptu'
import { css } from 'styled-components'
import { colors } from './theme'

export default css`
  ${normalize()} /* stylelint-disable-line max-empty-lines */

  html,
  body {
    background: ${colors.background};
    color: ${colors.white};
    font-family: 'RobotoMono', monospace;
    font-weight: 400;
  }

  #app {
    height: 100%;
    width: 100%;
  }
`

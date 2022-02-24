import { normalize, typography } from 'promptu'
import { css } from 'styled-components'
import { colors } from './theme'

export default css`
  ${normalize()} /* stylelint-disable-line max-empty-lines */

  ${typography.fontFace('RobotoMono', '/fonts/RobotoMono-Regular.ttf')}
  ${typography.fontFace('RobotoMono', '/fonts/RobotoMono-RegularItalic.ttf')}
  ${typography.fontFace('RobotoMono', '/fonts/RobotoMono-Bold.ttf')}
  ${typography.fontFace('RobotoMono', '/fonts/RobotoMono-BoldItalic.ttf')}
  ${typography.fontFace('NovaMono', '/fonts/NovaMono-Regular.ttf')}

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

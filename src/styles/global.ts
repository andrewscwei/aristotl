import { normalize, typography } from 'promptu';
import { createGlobalStyle } from 'styled-components';
import { colors } from './theme';

export default createGlobalStyle`
  ${normalize()} /* stylelint-disable-line max-empty-lines */

  ${typography.fontFace('RobotoMono', require('../assets/fonts/RobotoMono-Regular.ttf'), 400)}
  ${typography.fontFace('RobotoMono', require('../assets/fonts/RobotoMono-RegularItalic.ttf'), 400)}
  ${typography.fontFace('RobotoMono', require('../assets/fonts/RobotoMono-Bold.ttf'), 700)}
  ${typography.fontFace('RobotoMono', require('../assets/fonts/RobotoMono-BoldItalic.ttf'), 700)}
  ${typography.fontFace('NovaMono', require('../assets/fonts/NovaMono-Regular.ttf'), 400)}

  html,
  body {
    background: ${colors.background};
    color: ${colors.white};
    font-family: 'RobotoMono';
    font-weight: 400;
  }

  #app {
    height: auto;
  }
`;

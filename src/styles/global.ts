import { normalize, typography } from 'promptu';
import { createGlobalStyle } from 'styled-components';
import { colors } from './theme';

export default createGlobalStyle`
  ${normalize()} /* stylelint-disable-line max-empty-lines */

  ${typography.fontFace('Roboto', require('../assets/fonts/Roboto-Light.ttf'), 300)}
  ${typography.fontFace('Roboto', require('../assets/fonts/Roboto-Regular.ttf'), 400)}
  ${typography.fontFace('Roboto', require('../assets/fonts/Roboto-Bold.ttf'), 700)}
  ${typography.fontFace('Playfair', require('../assets/fonts/PlayfairDisplay-Regular.ttf'), 400)}
  ${typography.fontFace('Playfair', require('../assets/fonts/PlayfairDisplay-Bold.ttf'), 700)}

  html,
  body {
    background: ${colors.background};
    color: ${colors.white};
    font-family: 'Playfair';
  }
`;

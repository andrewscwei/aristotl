import { normalize, typography } from 'promptu';
import { css } from 'styled-components';
import { colors } from './theme';

export default css`
  ${normalize()} /* stylelint-disable-line max-empty-lines */

  ${typography.fontFace('Roboto', require('../assets/fonts/Roboto-Light.ttf'), 300)}
  ${typography.fontFace('Roboto', require('../assets/fonts/Roboto-Regular.ttf'), 400)}
  ${typography.fontFace('Roboto', require('../assets/fonts/Roboto-Bold.ttf'), 700)}

  html,
  body {
    background: ${colors.background};
    color: ${colors.white};
    font-family: 'Roboto';
  }
`;

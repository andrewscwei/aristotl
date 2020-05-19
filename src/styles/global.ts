import { normalize } from 'promptu';
import { createGlobalStyle } from 'styled-components';
import { colors } from './theme';

export default createGlobalStyle`
  ${normalize()} /* stylelint-disable-line max-empty-lines */

  html,
  body {
    background: ${colors.background};
    color: ${colors.white};
    font-family: 'RobotoMono', monospace;
    font-weight: 400;
  }
`;

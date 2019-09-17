import { css } from 'styled-components';

export const colors = {
  background: '#eee',
  white: '#ffffff',
  black: '#000000',
  darkBlue: '#180d50',
};

export const fonts = {
  search: css`
    font-family: 'Playfair';
    font-size: 16rem;
    font-weight: 400;
    line-height: 90%;
  `,
};

export const layout = {
  searchBarWidthRatioAboveMobile: 30,
  searchBarWidthRatioAboveTablet: 20,
};

export const z = {
  foreground: 1,
};

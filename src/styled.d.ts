import type { } from 'styled-components/cssprop'
import * as theme from './styles/theme'

// Supports typing for Styled Components theme.
type Theme = typeof theme

declare module 'styled-components' {
  interface DefaultTheme extends Theme {}
}

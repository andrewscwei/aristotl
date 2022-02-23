import { container, media } from 'promptu'
import React, { useEffect } from 'react'
import styled from 'styled-components'
import { useLtxt } from '../utils/i18n'

export default function NotFound() {
  const ltxt = useLtxt()

  useEffect(() => {
    document.title = ltxt('not-found')
  }, [])

  return (
    <StyledRoot>
      <StyledTitle>{ltxt('not-found-title')}</StyledTitle>
    </StyledRoot>
  )
}

const StyledTitle = styled.h1`
  color: ${props => props.theme.colors.white};
  font-size: 2.4em;
  font-weight: 400;
  margin: 0;
  max-width: 550px;
  text-align: center;
  text-transform: uppercase;
`

const StyledRoot = styled.div`
  ${container.fvcc}
  background: ${props => props.theme.colors.black};
  height: 100%;
  padding: 5rem 2rem 3rem;
  width: 100%;

  @media ${media.gtw(500)} {
    padding: 5rem 5rem 3rem;
  }
`

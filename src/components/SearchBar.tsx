import { align, container, selectors } from 'promptu'
import React, { ChangeEvent, HTMLAttributes, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import { AppState } from '../store'
import { changeFallaciesFilters, changeFallaciesSearchInput } from '../store/fallacies'
import { colors } from '../styles/theme'
import { useLtxt } from '../utils/i18n'
import ActionButton from './ActionButton'
import Pixel from './Pixel'

type Props = HTMLAttributes<HTMLDivElement> & {
  autoFocus: boolean
  input?: string
}

export default function SearchBar({
  autoFocus = true,
  input,
  ...props
}: Props) {
  const ltxt = useLtxt()
  const dispatch = useDispatch()
  const inputRef = useRef<HTMLInputElement>(null)
  const searchInput = useSelector((state: AppState) => state.fallacies.searchInput)

  const onKeyUp = (event: KeyboardEvent) => {
    if (!autoFocus) return
    if (!inputRef.current) return

    switch (event.keyCode) {
    case 37:
    case 38:
    case 39:
    case 40: return
    }

    if (inputRef.current === document.activeElement) return

    inputRef.current.focus()
  }

  const onClear = () => {
    dispatch(changeFallaciesSearchInput(''))
    dispatch(changeFallaciesFilters({
      formal: true,
      informal: true,
      alpha: true,
      beta: true,
      gamma: true,
    }))
  }

  useEffect(() => {
    window.addEventListener('keyup', onKeyUp)

    return () => {
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  return (
    <StyledRoot {...props}>
      <StyledPixels>
        <Pixel tintColor={colors.offBlack}/>
        <Pixel tintColor={colors.offBlack}/>
        <Pixel tintColor={colors.offBlack}/>
      </StyledPixels>
      <StyledInput>
        <input
          type='text'
          value={searchInput}
          ref={inputRef}
          placeholder={ltxt('search-placeholder')}
          maxLength={24}
          onChange={(event: ChangeEvent<HTMLInputElement>) => dispatch(changeFallaciesSearchInput(event.currentTarget.value))}
        />
      </StyledInput>
      <StyledActionButton
        symbol='c'
        isTogglable={true}
        tintColor={colors.white}
        hoverTintColor={colors.red}
        onActivate={() => onClear()}
      />
    </StyledRoot>
  )
}

const StyledPixels = styled.div`
  ${container.fvcc}
  ${align.cl}
  left: -1rem;
  margin-right: .4rem;

  ${selectors.eblc} {
    margin-bottom: .4rem;
  }
`

const StyledInput = styled.div`
  ${container.fvcl}
  ${props => props.theme.fonts.search}
  color: ${props => props.theme.colors.white};
  font-size: 2rem;
  height: 5rem;
  width: 100%;

  input {
    width: 100%;
    background: transparent;
  }
`

const StyledActionButton = styled(ActionButton)`
  margin-left: 1rem;
`

const StyledRoot = styled.div`
  ${container.fhcl}
  background: ${props => props.theme.colors.offBlack};
  max-width: 40rem;
  padding: 0 1rem;
  width: 100%;
  z-index: ${props => props.theme.z.foreground};
`

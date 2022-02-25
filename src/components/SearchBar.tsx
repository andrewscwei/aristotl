import _ from 'lodash'
import { align, container, selectors } from 'promptu'
import React, { ChangeEvent, HTMLAttributes, useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import { AppState } from '../store'
import { changeFallaciesFiltersAction, changeFallaciesSearchInputAction } from '../store/fallacies'
import { colors } from '../styles/theme'
import { useLtxt } from '../utils/i18n'
import ActionButton from './ActionButton'
import Pixel from './Pixel'

type Props = HTMLAttributes<HTMLDivElement> & {
  autoFocus: boolean
}

export default function SearchBar({
  autoFocus = true,
  ...props
}: Props) {
  const ltxt = useLtxt()
  const dispatch = useDispatch()
  const inputRef = useRef<HTMLInputElement>(null)
  const searchInput = useSelector((state: AppState) => state.fallacies.searchInput)
  const [input, setInput] = useState(searchInput)

  const onKeyUp = (event: KeyboardEvent) => {
    if (!inputRef.current) return

    switch (event.keyCode) {
    case 37: // Arrow keys
    case 38:
    case 39:
    case 40: return
    case 27: // Esc key
      if (inputRef.current !== document.activeElement) return
      inputRef.current.blur()
      break
    default:
      if (!autoFocus || inputRef.current === document.activeElement) return
      inputRef.current.focus()
    }
  }

  const clear = () => {
    dispatch(changeFallaciesSearchInputAction(''))
    dispatch(changeFallaciesFiltersAction({ formal: true, informal: true, alpha: true, beta: true, gamma: true }))
  }

  const search = useCallback(_.debounce(input => dispatch(changeFallaciesSearchInputAction(input)), __APP_CONFIG__.typeSearchDelay), [])

  useEffect(() => {
    window.addEventListener('keyup', onKeyUp)

    return () => {
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  useEffect(() => {
    setInput(searchInput)
  }, [searchInput])

  useEffect(() => {
    search(input)
  }, [input])

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
          value={input}
          ref={inputRef}
          placeholder={ltxt('search-placeholder')}
          maxLength={24}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setInput(event.currentTarget.value)}
        />
      </StyledInput>
      <StyledActionButton symbol='c' isTogglable={true} onActivate={() => clear()}/>
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

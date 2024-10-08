import { PrismicDocument } from '@prismicio/types'
import _ from 'lodash'
import { animations, classes, selectors } from 'promptu'
import React, { HTMLAttributes } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled from 'styled-components'
import { getFilteredFallacies, getFilteredFallaciesOnCurrentPage } from '../selectors'
import { AppState } from '../store'
import { changeFallaciesFiltersAction } from '../store/fallacies'
import { colors } from '../styles/theme'
import { useLocale } from '../utils/i18n'
import Pixel from './Pixel'

type Props = HTMLAttributes<HTMLDivElement>

export default function Statistics({
  ...props
}: Props) {
  const dispatch = useDispatch()
  const locale = useLocale()

  const filteredFallacies = useSelector(getFilteredFallacies(locale))
  const filteredFallaciesOnCurrentPage = useSelector(getFilteredFallaciesOnCurrentPage(locale))
  const filters = useSelector((state: AppState) => state.fallacies.filters)
  const pageIndex = useSelector((state: AppState) => state.fallacies.pageIndex)
  const pageSize = useSelector((state: AppState) => state.fallacies.pageSize)

  const countFormals = (docs: readonly PrismicDocument[]): number => docs.reduce((out, curr) => {
    const fragments = _.get(curr, 'data.types')
    const match = _.find(fragments, v => _.get(v, 'type.slug') === 'formal-fallacy') !== undefined
    if (match) out += 1
    return out
  }, 0)

  const countInformals = (docs: readonly PrismicDocument[]): number => docs.reduce((out, curr) => {
    const fragments = _.get(curr, 'data.types')
    const match = _.find(fragments, v => _.get(v, 'type.slug') === 'informal-fallacy') !== undefined
    if (match) out += 1
    return out
  }, 0)

  const countAlphas = (docs: readonly PrismicDocument[]): number => docs.reduce((out, curr) => {
    const fragments = _.get(curr, 'data.inheritance')
    if (!fragments || fragments.length === 0) out += 1
    return out
  }, 0)

  const countBetas = (docs: readonly PrismicDocument[]): number => docs.reduce((out, curr) => {
    const fragments = _.get(curr, 'data.inheritance')
    if (fragments && fragments.length === 1) out += 1
    return out
  }, 0)

  const countGammas = (docs: readonly PrismicDocument[]): number => docs.reduce((out, curr) => {
    const fragments = _.get(curr, 'data.inheritance')
    if (fragments && fragments.length >= 2) out += 1
    return out
  }, 0)

  const numResults = filteredFallacies.length
  const startIndex = pageSize * pageIndex + 1
  const endIndex = filteredFallaciesOnCurrentPage.length + startIndex - 1
  const numFormals = countFormals(filteredFallaciesOnCurrentPage)
  const numInformals = countInformals(filteredFallaciesOnCurrentPage)
  const numAlphas = countAlphas(filteredFallaciesOnCurrentPage)
  const numBetas = countBetas(filteredFallaciesOnCurrentPage)
  const numGammas = countGammas(filteredFallaciesOnCurrentPage)

  return (
    <StyledRoot {...props}>
      <StyledCount>
        {(startIndex === 0 || endIndex === 0 || numResults === 0) &&
          <span>--</span>
          ||
          <span>{startIndex}-{endIndex} / {numResults}</span>
        }
      </StyledCount>
      <StyledFilterButton isActive={filters.formal} onClick={() => dispatch(changeFallaciesFiltersAction({ ...filters, formal: !filters.formal }))}>
        <StyledFormalIcon size={6} isHollow={false} tintColor={colors.white}/>
        <span>{numFormals === 0 ? '--' : numFormals}</span>
      </StyledFilterButton>
      <StyledFilterButton isActive={filters.informal} onClick={() => dispatch(changeFallaciesFiltersAction({ ...filters, informal: !filters.informal }))}>
        <StyledInformalIcon size={6} isHollow={true} tintColor={colors.white}/>
        <span>{numInformals === 0 ? '--' : numInformals}</span>
      </StyledFilterButton>
      <StyledFilterButton isActive={filters.alpha} onClick={() => dispatch(changeFallaciesFiltersAction({ ...filters, alpha: !filters.alpha }))}>
        <span>α</span>
        <span>{numAlphas === 0 ? '--' : numAlphas}</span>
      </StyledFilterButton>
      <StyledFilterButton isActive={filters.beta} onClick={() => dispatch(changeFallaciesFiltersAction({ ...filters, beta: !filters.beta }))}>
        <span>β</span>
        <span>{numBetas === 0 ? '--' : numBetas}</span>
      </StyledFilterButton>
      <StyledFilterButton isActive={filters.gamma} onClick={() => dispatch(changeFallaciesFiltersAction({ ...filters, gamma: !filters.gamma }))}>
        <span>γ</span>
        <span>{numGammas === 0 ? '--' : numGammas}</span>
      </StyledFilterButton>
    </StyledRoot>
  )
}

const StyledFormalIcon = styled(Pixel)`
  ${animations.transition('background', 200, 'ease-out')}
`

const StyledInformalIcon = styled(Pixel)`
  ${animations.transition('border-color', 200, 'ease-out')}
`

const StyledCount = styled.div`
  ${classes.fhcl}
  font-size: 1.4rem;
  font-weight: 400;
  color: ${props => props.theme.colors.white};

  > * {
    flex: 0 0 auto;
  }

  ${selectors.eblc} {
    margin-right: .6rem;
  }
`

const StyledFilterButton = styled.button<{
  isActive: boolean
}>`
  ${classes.fhcl}
  ${animations.transition('opacity', 200, 'ease-out')}
  font-size: 1.4rem;
  font-weight: 400;
  color: ${props => props.theme.colors.white};
  opacity: ${props => props.isActive ? 1.0 : 0.2};

  > * {
    flex: 0 0 auto;
  }

  > span {
    ${animations.transition('color', 200, 'ease-out')}
  }

  ${selectors.eblc} {
    margin-right: .6rem;
  }

  ${selectors.hwot} {
    color: ${props => props.theme.colors.red};

    ${StyledFormalIcon} {
      background: ${props => props.theme.colors.red};
    }

    ${StyledInformalIcon} {
      border-color: ${props => props.theme.colors.red};
    }
  }
`

const StyledRoot = styled.div`
  ${classes.fhcl}
  flex-wrap: wrap;
  margin-left: 1rem;
  user-select: none;

  ${selectors.eblc} {
    margin-right: 3rem;
  }

  > * {
    flex: 0 0 auto;
  }
`

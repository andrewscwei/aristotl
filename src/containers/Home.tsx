import _ from 'lodash'
import { animations, classes, media, selectors } from 'promptu'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Transition, TransitionStatus } from 'react-transition-group'
import styled from 'styled-components'
import ActionButton from '../components/ActionButton'
import DefinitionStackModal from '../components/DefinitionStackModal'
import FallacyStackModal from '../components/FallacyStackModal'
import Footer from '../components/Footer'
import Grid from '../components/Grid'
import NavControlContainer from '../components/NavControlContainer'
import Paginator from '../components/Paginator'
import PreviewIndicator from '../components/PreviewIndicator'
import SearchBar from '../components/SearchBar'
import Statistics from '../components/Statistics'
import useLocationState from '../hooks/useLocationState'
import useRemoteDocs from '../hooks/useRemoteDocs'
import { getFilteredFallaciesOnCurrentPage, getMaxPagesOfFilteredFallacies } from '../selectors'
import { AppState } from '../store'
import { changeFallaciesPageAction, presentFallacyByIdAction } from '../store/fallacies'
import { colors } from '../styles/theme'
import { timeoutByTransitionStatus, valueByTransitionStatus } from '../styles/utils'
import { useLocale } from '../utils/i18n'
import { hasPreviewToken } from '../utils/prismic'

export default function Home() {
  const dispatch = useDispatch()
  const locale = useLocale()

  const [isSummaryEnabled, setIsSummaryEnabled] = useState(false)

  const activeDefinitionId = useSelector((state: AppState) => _.last(state.definitions.activeDocIds))
  const activeFallacyId = useSelector((state: AppState) => _.last(state.fallacies.activeDocIds))
  const fallacies = useSelector(getFilteredFallaciesOnCurrentPage(locale))
  const maxPages = useSelector(getMaxPagesOfFilteredFallacies(locale))
  const pageIndex = useSelector((state: AppState) => state.fallacies.pageIndex)
  const searchInput = useSelector((state: AppState) => state.fallacies.searchInput)

  useRemoteDocs()
  useLocationState()

  return (
    <>
      {hasPreviewToken() && <PreviewIndicator/>}
      <Transition in={!activeFallacyId} timeout={timeoutByTransitionStatus(200)} mountOnEnter={false}>
        {status => (
          <StyledRoot
            transitionStatus={status}
            isEnabled={!activeDefinitionId && !activeFallacyId}
            onPrev={() => dispatch(changeFallaciesPageAction((pageIndex + maxPages - 1) % maxPages))}
            onNext={() => dispatch(changeFallaciesPageAction((pageIndex + 1) % maxPages))}
          >
            <StyledHeader>
              <SearchBar autoFocus={!activeFallacyId && !activeDefinitionId}/>
              <ActionButton
                symbol='i'
                isTogglable={true}
                onToggleOn={() => setIsSummaryEnabled(true)}
                onToggleOff={() => setIsSummaryEnabled(false)}
                activeTintColor={colors.red}
              />
            </StyledHeader>
            <Statistics/>
            <Paginator pageIndex={pageIndex} numPages={maxPages} onActivate={idx => dispatch(changeFallaciesPageAction(idx))}/>
            <Grid
              uid={`${searchInput}-${pageIndex}`}
              docs={fallacies}
              isSummaryEnabled={isSummaryEnabled}
              onActivate={id => dispatch(presentFallacyByIdAction(id))}
            />
            <Footer/>
          </StyledRoot>
        )}
      </Transition>
      <FallacyStackModal/>
      <DefinitionStackModal/>
    </>
  )
}

const StyledHeader = styled.header`
  ${classes.fhcl}
  justify-content: space-between;
  margin-bottom: 1rem;
  width: 100%;

  ${selectors.eblc} {
    margin-right: 2rem;
  }
`

const StyledRoot = styled(NavControlContainer)<{
  transitionStatus: TransitionStatus
}>`
  ${animations.transition(['opacity', 'transform'], 200, 'ease-in-out')}
  ${classes.fvtl}
  background: ${props => props.theme.colors.black};
  min-height: 100%;
  opacity: ${props => valueByTransitionStatus([0.4, 1], props.transitionStatus)};
  padding: 5rem 2rem 3rem;
  padding-top: calc(5rem + env(safe-area-inset-top));
  padding-bottom: calc(3rem + env(safe-area-inset-bottom));
  perspective: 80rem;
  pointer-events: ${props => valueByTransitionStatus(['none', 'auto'], props.transitionStatus)};
  transform-origin: center;
  transform: ${props => valueByTransitionStatus(['translate3d(0, 0, 0) scale(.9)', 'translate3d(0, 0, 0) scale(1)'], props.transitionStatus)};
  width: 100%;

  @media ${media.gtw(500)} {
    padding: 5rem 5rem 3rem;
    padding-top: calc(5rem + env(safe-area-inset-top));
    padding-bottom: calc(3rem + env(safe-area-inset-bottom));
  }
`

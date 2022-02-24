import _ from 'lodash'
import { animations, container, media, selectors } from 'promptu'
import qs from 'query-string'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation, useNavigate } from 'react-router'
import { Transition, TransitionStatus } from 'react-transition-group'
import styled from 'styled-components'
import ActionButton from '../components/ActionButton'
import DefinitionStackModal from '../components/DefinitionStackModal'
import FallacyStackModal from '../components/FallacyStackModal'
import Footer from '../components/Footer'
import Grid from '../components/Grid'
import Paginator from '../components/Paginator'
import SearchBar from '../components/SearchBar'
import Statistics from '../components/Statistics'
import NavControlManager from '../managers/NavControlManager'
import { getDefinitions, getFallacies, getFilteredFallaciesOnCurrentPage, getMaxPagesOfFilteredFallacies, getMetadata } from '../selectors'
import { AppState } from '../store'
import { fetchDefinitionsAction, presentDefinitionByIdAction } from '../store/definitions'
import { changeFallaciesFiltersAction, changeFallaciesPageAction, changeFallaciesSearchInputAction, fetchFallaciesAction, presentFallacyByIdAction } from '../store/fallacies'
import { fetchMetadataAction } from '../store/metadata'
import { colors } from '../styles/theme'
import { timeoutByTransitionStatus, valueByTransitionStatus } from '../styles/utils'
import { loadPreviewToken } from '../utils/prismic'

export default function Home() {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const activeDefinitionIds = useSelector((state: AppState) => state.definitions.activeDocIds)
  const activeFallacyIds = useSelector((state: AppState) => state.fallacies.activeDocIds)
  const definitions = useSelector((state: AppState) => getDefinitions(state))
  const fallacies = useSelector((state: AppState) => getFallacies(state))
  const filteredFallaciesOnCurrentPage = useSelector((state: AppState) => getFilteredFallaciesOnCurrentPage(state))
  const filters = useSelector((state: AppState) => state.fallacies.filters)
  const maxPages = useSelector((state: AppState) => getMaxPagesOfFilteredFallacies(state))
  const metadataDoc = useSelector((state: AppState) => getMetadata(state))
  const pageIndex = useSelector((state: AppState) => state.fallacies.pageIndex)
  const searchInput = useSelector((state: AppState) => state.fallacies.searchInput)
  const lastActiveFallacyId = _.last(activeFallacyIds)
  const lastActiveDefinitionId = _.last(activeDefinitionIds)
  const [isSummaryEnabled, setIsSummaryEnabled] = useState(false)

  const toNextPage = () => {
    const idx = (pageIndex + 1) % maxPages
    dispatch(changeFallaciesPageAction(idx))
  }

  const toPreviousPage = () => {
    const idx = (pageIndex + maxPages - 1) % maxPages
    dispatch(changeFallaciesPageAction(idx))
  }

  const mapLocationToProps = () => {
    const { s: search, p: page, ff: formal, fi: informal, fa: alpha, fb: beta, fg: gamma, d: definitions, f: fallacies } = qs.parse(location.search)

    if (__APP_CONFIG__.enableHistoryForSearch) {
      const searchInput = (typeof search === 'string' && search !== '') ? search : ''
      dispatch(changeFallaciesSearchInputAction(searchInput))
    }

    if (__APP_CONFIG__.enableHistoryForFilters) {
      dispatch(changeFallaciesFiltersAction({
        formal: formal !== 'no',
        informal: informal !== 'no',
        alpha: alpha !== 'no',
        beta: beta !== 'no',
        gamma: gamma !== 'no',
      }))
    }

    if (__APP_CONFIG__.enableHistoryForFallacies) {
      const activeFallacyId = location.hash.startsWith('#') ? location.hash.substring(1) : undefined

      if (fallacies) {
        if (typeof fallacies === 'string') {
          dispatch(presentFallacyByIdAction(fallacies))
        }
        else {
          for (const fallacyId of fallacies) {
            if (!fallacyId) continue
            dispatch(presentFallacyByIdAction(fallacyId))
          }
        }
      }

      if (activeFallacyId) dispatch(presentFallacyByIdAction(activeFallacyId))
    }

    if (__APP_CONFIG__.enableHistoryForDefinitions) {
      if (definitions) {
        if (typeof definitions === 'string') {
          dispatch(presentDefinitionByIdAction(definitions))
        }
        else {
          for (const definitionId of definitions) {
            if (!definitionId) continue
            dispatch(presentDefinitionByIdAction(definitionId))
          }
        }
      }
    }

    if (__APP_CONFIG__.enableHistoryForPageIndexes) {
      const pageIndex = ((typeof page === 'string') && parseInt(page, 10) || 1) - 1
      dispatch(changeFallaciesPageAction(pageIndex))
    }
  }

  const mapPropsToLocation = () => {
    const params: any = {}
    let hash

    if (__APP_CONFIG__.enableHistoryForSearch) {
      if (!_.isEmpty(searchInput)) params.s = searchInput
    }

    if (__APP_CONFIG__.enableHistoryForPageIndexes) {
      if (pageIndex > 0) params.p = pageIndex + 1
    }

    if (__APP_CONFIG__.enableHistoryForFilters) {
      if (!filters.formal) params.ff = 'no'
      if (!filters.informal) params.fi = 'no'
      if (!filters.alpha) params.fa = 'no'
      if (!filters.beta) params.fb = 'no'
      if (!filters.gamma) params.fg = 'no'
    }

    if (__APP_CONFIG__.enableHistoryForFallacies) {
      const lastActiveId = _.last(activeFallacyIds)
      const prevActiveIds = _.dropRight(activeFallacyIds)
      hash = lastActiveId

      if (prevActiveIds.length > 0) params.f = prevActiveIds
    }

    if (__APP_CONFIG__.enableHistoryForDefinitions) {
      if (activeDefinitionIds.length > 0) params.d = activeDefinitionIds
    }

    navigate({
      pathname: '/',
      hash,
      search: _.isEmpty(params) ? undefined : `?${qs.stringify(params)}`,
    }, { replace: true })
  }

  useEffect(() => {
    const previewToken = loadPreviewToken()

    if (!metadataDoc || previewToken) dispatch(fetchMetadataAction())
    if ((fallacies.length === 0) || previewToken) dispatch(fetchFallaciesAction())
    if ((definitions.length === 0) || previewToken) dispatch(fetchDefinitionsAction())

    mapLocationToProps()
  }, [])

  useEffect(() => {
    mapPropsToLocation()
  }, [
    ...__APP_CONFIG__.enableHistoryForSearch ? [searchInput] : [],
    ...__APP_CONFIG__.enableHistoryForPageIndexes ? [pageIndex] : [],
    ...__APP_CONFIG__.enableHistoryForFilters ? [filters] : [],
    ...__APP_CONFIG__.enableHistoryForFallacies ? [activeFallacyIds] : [],
    ...__APP_CONFIG__.enableHistoryForDefinitions ? [activeDefinitionIds] : [],
  ])

  return (
    <>
      <Transition in={!lastActiveFallacyId} timeout={timeoutByTransitionStatus(200)} mountOnEnter={false}>
        {status => (
          <NavControlManager
            isEnabled={!lastActiveDefinitionId && !lastActiveFallacyId}
            onPrev={() => toPreviousPage()}
            onNext={() => toNextPage()}
          >
            <StyledRoot transitionStatus={status}>
              <StyledHeader>
                <SearchBar autoFocus={!lastActiveFallacyId && !lastActiveDefinitionId}/>
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
                id={`${searchInput}-${pageIndex}`}
                docs={filteredFallaciesOnCurrentPage}
                isSummaryEnabled={isSummaryEnabled}
                onActivate={id => dispatch(presentFallacyByIdAction(id))}
              />
              <Footer/>
            </StyledRoot>
          </NavControlManager>
        )}
      </Transition>
      <FallacyStackModal/>
      <DefinitionStackModal/>
    </>
  )
}

const StyledHeader = styled.header`
  ${container.fhcl}
  justify-content: space-between;
  margin-bottom: 1rem;
  width: 100%;

  ${selectors.eblc} {
    margin-right: 2rem;
  }
`

const StyledRoot = styled.div<{
  transitionStatus: TransitionStatus
}>`
  ${animations.transition(['opacity', 'transform'], 200, 'ease-in-out')}
  ${container.fvtl}
  background: ${props => props.theme.colors.black};
  min-height: 100%;
  opacity: ${props => valueByTransitionStatus([0.4, 1], props.transitionStatus)};
  padding: 5rem 2rem 3rem;
  perspective: 80rem;
  pointer-events: ${props => valueByTransitionStatus(['none', 'auto'], props.transitionStatus)};
  transform-origin: center;
  transform: ${props => valueByTransitionStatus(['translate3d(0, 0, 0) scale(.9)', 'translate3d(0, 0, 0) scale(1)'], props.transitionStatus)};
  width: 100%;

  @media ${media.gtw(500)} {
    padding: 5rem 5rem 3rem;
  }
`

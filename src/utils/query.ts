import _ from 'lodash'
import { Dispatch } from 'redux'
import { AppState } from '../store'
import { presentDefinitionByIdAction } from '../store/definitions'
import { changeFallaciesFiltersAction, changeFallaciesPageAction, changeFallaciesSearchInputAction, presentFallacyByIdAction } from '../store/fallacies'

export function mapStateToSearchParams(state: AppState): URLSearchParams {
  const params = new URLSearchParams()

  if (__APP_CONFIG__.enableHistoryForSearch) {
    const value = state.fallacies.searchInput
    if (!_.isEmpty(value)) params.set('s', value)
  }

  if (__APP_CONFIG__.enableHistoryForPageIndexes) {
    const value = state.fallacies.pageIndex
    if (value > 0) params.set('p', (value + 1).toString())
  }

  if (__APP_CONFIG__.enableHistoryForFilters) {
    const value = state.fallacies.filters

    if (value.formal === false) params.set('ff', 'no')
    if (value.informal === false) params.set('fi', 'no')
    if (value.alpha === false) params.set('fa', 'no')
    if (value.beta === false) params.set('fb', 'no')
    if (value.gamma === false) params.set('fg', 'no')
  }

  if (__APP_CONFIG__.enableHistoryForFallacies) {
    const value = state.fallacies.activeDocIds
    _.dropRight(value).forEach(id => params.append('f', id))
  }

  if (__APP_CONFIG__.enableHistoryForDefinitions) {
    const value = state.definitions.activeDocIds
    value.forEach(id => params.append('d', id))
  }

  return params
}

export function mapSearchParamsToState(searchParams: URLSearchParams, dispatch: Dispatch) {
  if (__APP_CONFIG__.enableHistoryForSearch) {
    dispatch(changeFallaciesSearchInputAction(searchParams.get('s') ?? ''))
  }

  if (__APP_CONFIG__.enableHistoryForFilters) {
    dispatch(changeFallaciesFiltersAction({
      formal: searchParams.get('ff') !== 'no',
      informal: searchParams.get('fi') !== 'no',
      alpha: searchParams.get('fa') !== 'no',
      beta: searchParams.get('fb') !== 'no',
      gamma: searchParams.get('fg') !== 'no',
    }))
  }

  if (__APP_CONFIG__.enableHistoryForFallacies) {
    for (const fallacyId of searchParams.getAll('f')) {
      dispatch(presentFallacyByIdAction(fallacyId))
    }
  }

  if (__APP_CONFIG__.enableHistoryForDefinitions) {
    for (const definitionId of searchParams.getAll('d')) {
      dispatch(presentDefinitionByIdAction(definitionId))
    }
  }

  if (__APP_CONFIG__.enableHistoryForPageIndexes) {
    dispatch(changeFallaciesPageAction(parseInt(searchParams.get('p') ?? '1', 10) - 1))
  }
}

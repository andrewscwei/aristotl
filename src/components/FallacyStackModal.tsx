import { PrismicDocument } from '@prismicio/types'
import _ from 'lodash'
import { animations, classes, utils } from 'promptu'
import React, { HTMLAttributes } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Transition, TransitionGroup } from 'react-transition-group'
import { TransitionStatus } from 'react-transition-group/Transition'
import styled from 'styled-components'
import Fallacy from '../components/Fallacy'
import Modal from '../components/Modal'
import { getFallacies } from '../selectors'
import { AppState } from '../store'
import { dismissFallacyByIdAction, presentFallacyByIdAction } from '../store/fallacies'
import { timeoutByTransitionStatus, valueByTransitionStatus } from '../styles/utils'
import { useLocale } from '../utils/i18n'

type Props = HTMLAttributes<HTMLDivElement>

export default function FallacyStackModal({
  ...props
}: Props) {
  const dispatch = useDispatch()
  const locale = useLocale()

  const activeDefinitionIds = useSelector((state: AppState) => state.definitions.activeDocIds)
  const activeFallacyIds = useSelector((state: AppState) => state.fallacies.activeDocIds)
  const fallacies = useSelector(getFallacies(locale))

  const getPrevDoc = (currDocId: string): PrismicDocument | undefined => {
    const currIndex = _.findIndex(fallacies, v => v.uid === currDocId)
    if (currIndex < 1) return undefined
    return fallacies[currIndex - 1]
  }

  const getNextDoc = (currDocId: string): PrismicDocument | undefined => {
    const currIndex = _.findIndex(fallacies, v => v.uid === currDocId)
    if (currIndex >= (fallacies.length - 1)) return undefined
    return fallacies[currIndex + 1]
  }

  const onPrev = (currDocId: string) => {
    const doc = getPrevDoc(currDocId)
    if (!doc || !doc.uid) return
    dispatch(presentFallacyByIdAction(doc.uid))
    dispatch(dismissFallacyByIdAction(currDocId))
  }

  const onNext = (currDocId: string) => {
    const doc = getNextDoc(currDocId)
    if (!doc || !doc.uid) return
    dispatch(presentFallacyByIdAction(doc.uid))
    dispatch(dismissFallacyByIdAction(currDocId))
  }

  return (
    <StyledRoot {...props} isFocused={activeFallacyIds.length > 0}>
      <TransitionGroup>
        {(activeFallacyIds.map((fallacyId, i) => (
          <Transition key={fallacyId} timeout={timeoutByTransitionStatus(200, true)} mountOnEnter={true} unmountOnExit={true}>
            {status => (
              <Modal
                isFocused={i === (activeFallacyIds.length - 1) && activeDefinitionIds.length === 0}
                transitionStatus={status}
                onPrev={getPrevDoc(fallacyId) ? () => onPrev(fallacyId) : undefined}
                onNext={getNextDoc(fallacyId) ? () => onNext(fallacyId) : undefined}
                onExit={() => dispatch(dismissFallacyByIdAction(fallacyId))}
              >
                {(scrollTargetRef, onExit, onPrev, onNext) => (
                  <StyledFallacy
                    docId={fallacyId}
                    ref={scrollTargetRef}
                    stackIndex={activeFallacyIds.length - i - 1}
                    transitionStatus={status}
                    onPrev={onPrev}
                    onNext={onNext}
                    onExit={onExit}
                  />
                )}
              </Modal>
            )}
          </Transition>
        )))}
      </TransitionGroup>
    </StyledRoot>
  )
}

const StyledFallacy = styled(Fallacy)<{
  stackIndex: number
  transitionStatus?: TransitionStatus
}>`
  ${classes.tr}
  ${animations.transition(['opacity', 'transform'], 200, 'ease-out')}
  height: 100%;
  max-width: 60rem;
  opacity: ${props => valueByTransitionStatus([0, props.stackIndex === 0 ? 1 : 0.6], props.transitionStatus, true)};
  pointer-events: ${props => props.stackIndex === 0 ? 'auto' : 'none'};
  transform: ${props => valueByTransitionStatus(['translate3d(10%, 0, 0)', `translate3d(${-props.stackIndex * 2}rem, 0, 0)`], props.transitionStatus, true)};
  width: 90%;
`

const StyledRoot = styled.div<{
  isFocused: boolean
}>`
  ${classes.ftl}
  ${animations.transition('background', 200, 'ease-out')}
  background: ${props => utils.toRGBAString(props.theme.colors.black, props.isFocused ? 0.4 : 0)};
  height: 100%;
  pointer-events: ${props => props.isFocused ? 'auto' : 'none'};
  width: 100%;
  z-index: ${props => props.theme.z.overlays};
`

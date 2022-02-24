import _ from 'lodash'
import { align, animations, utils } from 'promptu'
import React, { HTMLAttributes } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Transition, TransitionGroup } from 'react-transition-group'
import { TransitionStatus } from 'react-transition-group/Transition'
import styled from 'styled-components'
import Definition from '../components/Definition'
import Modal from '../components/Modal'
import { AppState } from '../store'
import { dismissDefinitionByIdAction } from '../store/definitions'
import { timeoutByTransitionStatus, valueByTransitionStatus } from '../styles/utils'

type Props = HTMLAttributes<HTMLDivElement>

const DX = [...Array(10).keys()].map(() => _.random(0, 1) === 0 ? 3 : -3)
const DY = [...Array(10).keys()].map(() => _.random(0, 1) === 0 ? 3 : -3)

export default function DefinitionStackModal({
  ...props
}: Props) {
  const dispatch = useDispatch()
  const activeDefinitionIds = useSelector((state: AppState) => state.definitions.activeDocIds)

  return (
    <StyledRoot {...props} isFocused={activeDefinitionIds.length > 0}>
      <TransitionGroup>
        {(activeDefinitionIds.map((definitionId, i) => (
          <Transition key={definitionId} timeout={timeoutByTransitionStatus(200, true)} mountOnEnter={true} unmountOnExit={true}>
            {status => (
              <Modal
                isFocused={i === (activeDefinitionIds.length - 1)}
                transitionStatus={status}
                onExit={() => dispatch(dismissDefinitionByIdAction(definitionId))}
              >
                {scrollTargetRef => (
                  <StyledDefinition
                    docId={definitionId}
                    maxStacks={activeDefinitionIds.length}
                    ref={scrollTargetRef}
                    stackIndex={i}
                    transitionStatus={status}
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

const StyledDefinition = styled(Definition)<{
  stackIndex: number
  maxStacks: number
  transitionStatus?: TransitionStatus
}>`
  ${animations.transition(['opacity', 'transform'], 200, 'ease-out')}
  max-width: 50rem;
  opacity: ${props => (props.stackIndex === (props.maxStacks - 1)) ? 1 : 0.6};
  pointer-events: ${props => (props.stackIndex === (props.maxStacks - 1)) ? 'auto' : 'none'};
  transform: ${props => valueByTransitionStatus(['translate3d(0, 0, 0) scale(.97)', `translate3d(${(props.maxStacks - 1 - props.stackIndex) * DX[props.stackIndex % 10]}rem, ${(props.maxStacks - 1 - props.stackIndex) * DY[props.stackIndex % 10]}rem, 0) scale(1)`], props.transitionStatus, true)};
  width: 90%;
`

const StyledRoot = styled.div<{
  isFocused: boolean
}>`
  ${align.ftl}
  ${animations.transition('background', 200, 'ease-out')}
  background: ${props => utils.toRGBAString(props.theme.colors.black, props.isFocused ? 0.4 : 0)};
  height: 100%;
  pointer-events: ${props => props.isFocused ? 'auto' : 'none'};
  width: 100%;
  z-index: ${props => props.theme.z.overlays};
`

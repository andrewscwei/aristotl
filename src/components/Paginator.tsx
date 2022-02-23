import { align, animations, container, selectors } from 'promptu'
import React, { PureComponent } from 'react'
import styled from 'styled-components'
import { colors } from '../styles/theme'
import ActionButton from './ActionButton'
import Pixel from './Pixel'

interface Props {
  className?: string
  numPages: number
  pageIndex: number
  tintColor: string
  onActivate: (pageIndex: number) => void
}

class Paginator extends PureComponent<Props> {
  static defaultProps: Partial<Props> = {
    numPages: 1,
    pageIndex: 0,
    tintColor: colors.white,
    onActivate: () => {},
  }

  prev() {
    const pageIndex = (this.props.pageIndex + this.props.numPages - 1) % this.props.numPages
    this.props.onActivate(pageIndex)
  }

  next() {
    const pageIndex = (this.props.pageIndex + 1) % this.props.numPages
    this.props.onActivate(pageIndex)
  }

  render() {
    return (
      <StyledRoot className={this.props.className}>
        {[...Array(Math.max(1, this.props.numPages)).keys()].map((v, i) => (
          <StyledButton
            key={i}
            isActive={this.props.pageIndex === i}
            onClick={() => this.props.onActivate(i)}
          >
            <Pixel
              isHollow={this.props.pageIndex !== i}
              size={10}
              tintColor={this.props.tintColor}
            />
          </StyledButton>
        ))}
        {/* <StyledPrevButton
          symbol='<'
          tintColor={colors.white}
          hoverTintColor={colors.red}
          isDisabled={this.props.numPages === 1}
          onActivate={() => this.prev()}
        />

        <StyledNextButton
          symbol='>'
          tintColor={colors.white}
          hoverTintColor={colors.red}
          isDisabled={this.props.numPages === 1}
          onActivate={() => this.next()}
        /> */}
      </StyledRoot>
    )
  }
}

export default Paginator

const StyledPrevButton = styled(ActionButton)<{
  isDisabled: boolean
}>`
  ${align.cl}
  left: -3rem;
  pointer-events: ${props => props.isDisabled ? 'none' : 'auto'};
  opacity: ${props => props.isDisabled ? 0 : 1.0};
`

const StyledNextButton = styled(ActionButton)<{
  isDisabled: boolean
}>`
  ${align.cr}
  right: -3rem;
  pointer-events: ${props => props.isDisabled ? 'none' : 'auto'};
  opacity: ${props => props.isDisabled ? 0 : 1.0};
`

const StyledButton = styled.button<{
  isActive: boolean
}>`
  ${animations.transition('transform', 200, 'ease-out')}
  pointer-events: ${props => props.isActive ? 'none' : 'auto'};
  transform: translate3d(0, 0, 0) ${props => props.isActive ? 'scale(1.5)' : 'scale(1)'};
  margin: 0 .5rem;

  ${selectors.hwot} {
    transform: translate3d(0, 0, 0) scale(1.5);
  }
`

const StyledRoot = styled.div`
  ${container.fhcc}
  align-self: center;
  margin: 5rem 0 3rem;
`

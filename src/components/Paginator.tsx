import { animations, container, selectors } from 'promptu';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Action, bindActionCreators, Dispatch } from 'redux';
import styled from 'styled-components';
import { AppState } from '../store';
import { changePageIndex } from '../store/fallacies';
import { colors } from '../styles/theme';
import Pixel from './Pixel';

interface StateProps {

}

interface DispatchProps {
  changePageIndex: typeof changePageIndex;
}

interface Props extends StateProps, DispatchProps {
  activePageIndex: number;
  className?: string;
  id?: string;
  numPages: number;
  tintColor: string;
}

class Paginator extends PureComponent<Props> {
  static defaultProps: Partial<Props> = {
    activePageIndex: 0,
    numPages: 1,
    tintColor: colors.white,
  };

  prev() {
    const pageIndex = (this.props.activePageIndex + this.props.numPages - 1) % this.props.numPages;
    this.props.changePageIndex(pageIndex);
  }

  next() {
    const pageIndex = (this.props.activePageIndex + 1) % this.props.numPages;
    this.props.changePageIndex(pageIndex);
  }

  render() {
    return (
      <StyledRoot id={this.props.id} className={this.props.className}>
        {[...Array(Math.max(1, this.props.numPages)).keys()].map((v, i) => (
          <StyledButton
            key={i}
            isActive={this.props.activePageIndex === i}
            onClick={() => this.props.changePageIndex(i)}
          >
            <Pixel
              isHollow={this.props.activePageIndex !== i}
              size={10}
              tintColor={this.props.tintColor}
            />
          </StyledButton>
        ))}
      </StyledRoot>
    );
  }
}

export default connect(
  (state: AppState): StateProps => ({

  }),
  (dispatch: Dispatch<Action>): DispatchProps => bindActionCreators({
    changePageIndex,
  }, dispatch),
  undefined,
  { forwardRef: true },
)(Paginator);

const StyledButton = styled.button<{
  isActive: boolean;
}>`
  ${animations.transition('transform', 200, 'ease-out')}
  transform: translate3d(0, 0, 0) ${(props) => props.isActive ? 'scale(1.5)' : 'scale(1)'};
  pointer-events: ${(props) => props.isActive ? 'none' : 'auto'};

  ${selectors.hwot} {
    transform: translate3d(0, 0, 0) scale(1.5);
  }
`;

const StyledRoot = styled.div`
  ${container.fhcc}
  margin: 5rem 0 3rem;
  width: 100%;

  ${selectors.eblc} {
    margin-right: 1rem;
  }
`;

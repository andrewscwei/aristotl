import $$IconClose from '!raw-loader!../assets/images/icon-close.svg';
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import _ from 'lodash';
import { Document } from 'prismic-javascript/d.ts/documents';
import { align, animations, container, selectors } from 'promptu';
import React, { createRef, PureComponent } from 'react';
import { connect } from 'react-redux';
import { Action, bindActionCreators, Dispatch } from 'redux';
import styled from 'styled-components';
import { AppState } from '../store';
import { I18nState } from '../store/i18n';

interface StateProps {
  i18n: I18nState;
}

interface DispatchProps {

}

interface Props extends StateProps, DispatchProps {
  className?: string;
  id?: string;
  doc: Document;
  onExit: () => void;
}

class Datasheet extends PureComponent<Props> {
  static defaultProps: Partial<Props> = {
    onExit: () => {},
  };

  nodeRefs = {
    root: createRef<HTMLDivElement>(),
  };

  componentDidMount() {
    if (this.nodeRefs.root.current) disableBodyScroll(this.nodeRefs.root.current);
  }

  componentWillUnmount() {
    if (this.nodeRefs.root.current) enableBodyScroll(this.nodeRefs.root.current);
  }

  render() {
    const { ltxt } = this.props.i18n;
    const abbreviation = _.get(this.props.doc, 'data.abbreviation');
    const name = _.get(this.props.doc, 'data.name');
    const description = _.get(this.props.doc, 'data.description');

    return (
      <StyledRoot id={this.props.id} className={this.props.className} ref={this.nodeRefs.root}>
        <StyledCloseButton onClick={() => this.props.onExit()} dangerouslySetInnerHTML={{ __html: $$IconClose }}/>
      </StyledRoot>
    );
  }
}

export default connect(
  (state: AppState): StateProps => ({
    i18n: state.i18n,
  }),
  (dispatch: Dispatch<Action>): DispatchProps => bindActionCreators({

  }, dispatch),
)(Datasheet);

const StyledCloseButton = styled.button`
  ${container.box}
  ${align.tl}
  height: 2rem;
  margin: 3rem;
  width: 2rem;

  svg {
    width: 100%;
    height: 100%;

    * {
      ${animations.transition('fill', 300, 'ease-out')}
      fill: #000;
    }
  }

  ${selectors.hwot} {
    svg * {
      fill: #f0f;
    }
  }
`;

const StyledRoot = styled.div`
  ${align.fbl}
  -webkit-overflow-scrolling: touch;
  background: #fff;
  height: 50rem;
  overflow-x: hidden;
  overflow-y: scroll;
  width: 100%;
  z-index: ${(props) => props.theme.z.overlays};
`;

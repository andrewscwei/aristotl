import _ from 'lodash';
import { Document } from 'prismic-javascript/d.ts/documents';
import { align, animations, container, selectors } from 'promptu';
import React, { forwardRef, Fragment, PureComponent, Ref } from 'react';
import { connect } from 'react-redux';
import { Action, bindActionCreators, Dispatch } from 'redux';
import styled from 'styled-components';
import { AppState } from '../store';
import { dismissDefinitionById, presentDefinitionById } from '../store/definitions';
import { I18nState } from '../store/i18n';
import { colors } from '../styles/theme';
import { getMarkup, getMarkups, getText, getTexts } from '../utils/prismic';
import ActionButton from './ActionButton';
import RichText from './RichText';

interface StateProps {
  definitionDict: ReadonlyArray<Document>;
  i18n: I18nState;
}

interface DispatchProps {
  presentDefinitionById: typeof presentDefinitionById;
  dismissDefinitionById: typeof dismissDefinitionById;
}

interface OwnProps {
  className?: string;
  docId?: string;
  scrollTargetRef?: Ref<HTMLDivElement>;
}

interface Props extends StateProps, DispatchProps, OwnProps {}

class Definition extends PureComponent<Props> {
  get doc(): Document | undefined {
    if (!this.props.docId) return undefined;
    return _.find(this.props.definitionDict, (v) => v.id === this.props.docId);
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.docId !== this.props.docId) {
      _.set(this.props, 'scrollTargetRef.current.scrollTop', 0);
    }
  }

  render() {
    const { ltxt } = this.props.i18n;
    const name = getText(this.doc, 'data.name');
    const descriptionMarkup = getMarkup(this.doc, 'data.description');
    const aliases = getTexts(this.doc, 'data.aliases', 'name');
    const referenceMarkups = getMarkups(this.doc, 'data.references', 'reference');

    return (
      <StyledRoot className={this.props.className}>
        <StyledCloseButton
          symbol='-'
          tintColor={colors.darkBlue}
          hoverTintColor={colors.red}
          onActivate={() => { if (this.props.docId) this.props.dismissDefinitionById(this.props.docId); }}
        />
        <StyledTitle>{name}</StyledTitle>
        {aliases && <StyledAliases><em>{aliases.join(', ')}</em></StyledAliases>}
        <StyledContent ref={this.props.scrollTargetRef}>
          {descriptionMarkup && <RichText markup={descriptionMarkup}/>}
          {(referenceMarkups && referenceMarkups.length > 0) &&
            <Fragment>
              <StyledDivider/>
              <ul>
                {referenceMarkups.map((v, i) => (
                  <li key={`reference-${i}`} dangerouslySetInnerHTML={{ __html: v }}/>
                ))}
              </ul>
            </Fragment>
          }
        </StyledContent>
      </StyledRoot>
    );
  }
}

const ConnectedDefinition = connect(
  (state: AppState): StateProps => ({
    definitionDict: state.definitions.docs[__I18N_CONFIG__.defaultLocale] || [],
    i18n: state.i18n,
  }),
  (dispatch: Dispatch<Action>): DispatchProps => bindActionCreators({
    presentDefinitionById,
    dismissDefinitionById,
  }, dispatch),
)(Definition);

export default forwardRef((props: OwnProps, ref: Ref<HTMLDivElement>) => <ConnectedDefinition {...props} scrollTargetRef={ref}/>);

const StyledCloseButton = styled(ActionButton)`
  ${align.tl}
  margin: 2rem;
`;

const StyledAliases = styled.div`
  margin-bottom: 1rem;
  padding: 0 2rem;
  width: 100%;
`;

const StyledTitle = styled.h2`
  font-family: 'RobotoMono';
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 1rem;
  padding: 0 2rem;
  text-transform: uppercase;
`;

const StyledContent = styled.div`
  -webkit-overflow-scrolling: touch;
  font-size: 1.4rem;
  max-height: 24rem;
  overflow-y: scroll;
  padding: 0 2rem;
  width: 100%;

  ul, ol {
    ${container.fvtl}
    width: 100%;
    margin: 0;
    padding: 0;

    li {
      margin-left: 3rem;
      width: calc(100% - 3rem);
    }

    ${selectors.eblc} {
      margin-bottom: .5rem;
    }
  }

  ul {
    list-style: square;

    ul {
      list-style: circle;
    }
  }

  ol {
    list-style: decimal;

    ol {
      list-style: lower-roman;
    }
  }

  p + p,
  p + pre,
  p + ol,
  p + ul,
  pre + p,
  pre + pre,
  pre + ol,
  pre + ul,
  ol + p,
  ol + pre,
  ol + ol,
  ol + ul,
  ul + p,
  ul + pre,
  ul + ul,
  ul + ol {
    margin-top: 1rem;
  }

  pre {
    ${container.box}
    background: ${(props) => props.theme.colors.darkPink};
    color: ${(props) => props.theme.colors.black};
    margin: 0;
    padding: 1rem;
    width: 100%;
  }

  a:not([href]) {
    ${animations.transition('color', 200, 'ease-out')}
    color: ${(props) => props.theme.colors.red};
    cursor: pointer;
    font-weight: 700;

    ${selectors.hwot} {
      color: inherit;
      text-decoration: underline;
    }
  }

  a[href] {
    ${animations.transition('opacity', 200, 'ease-out')}
    color: inherit;
    cursor: pointer;
    font-weight: inherit;
    text-decoration: underline;

    ${selectors.hwot} {
      color: inherit;
      opacity: 0.6;
    }
  }
`;

const StyledDivider = styled.hr`
  background: ${(props) => props.theme.colors.darkBlue};
  border: none;
  height: 1px;
  margin: 2rem 0;
  width: 100%;
`;

const StyledRoot = styled.div`
  background: ${(props) => props.theme.colors.pink};
  color: ${(props) => props.theme.colors.darkBlue};
  font-family: 'RobotoMono';
  font-size: 1.4rem;
  font-weight: 400;
  padding: 6rem 0 3rem;
  user-select: text;
`;

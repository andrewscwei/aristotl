import _ from 'lodash';
import { Document } from 'prismic-javascript/d.ts/documents';
import { align, animations, container, selectors } from 'promptu';
import React, { forwardRef, MouseEvent, PureComponent, Ref } from 'react';
import { connect } from 'react-redux';
import { Action, bindActionCreators, Dispatch } from 'redux';
import styled from 'styled-components';
import { AppState } from '../store';
import { presentDefinitionById } from '../store/definitions';
import { dismissFallacyById, presentFallacyById } from '../store/fallacies';
import { I18nState } from '../store/i18n';
import { colors } from '../styles/theme';
import { getDocs, getMarkup, getMarkups, getText, getTexts } from '../utils/prismic';
import ActionButton from './ActionButton';
import Pixel from './Pixel';
import RichText from './RichText';

interface StateProps {
  definitionDict: ReadonlyArray<Document>;
  fallacyDict: ReadonlyArray<Document>;
  i18n: I18nState;
}

interface DispatchProps {
  presentFallacyById: typeof presentFallacyById;
  dismissFallacyById: typeof dismissFallacyById;
  presentDefinitionById: typeof presentDefinitionById;
}

interface OwnProps {
  className?: string;
  docId?: string;
  nodeRef?: Ref<HTMLDivElement>;
}

interface Props extends StateProps, DispatchProps, OwnProps {}

class Fallacy extends PureComponent<Props> {
  get doc(): Document | undefined {
    if (!this.props.docId) return undefined;
    return _.find(this.props.fallacyDict, (v) => v.id === this.props.docId);
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.docId !== this.props.docId) {
      _.set(this.props, 'nodeRef.current.scrollTop', 0);
    }
  }

  onTypeSelect(docId: string) {
    return (event: MouseEvent) => {
      event.preventDefault();
      this.props.presentDefinitionById(docId);
    };
  }

  render() {
    const { ltxt } = this.props.i18n;
    const abbreviation = getText(this.doc, 'data.abbreviation');
    const name = getText(this.doc, 'data.name');
    const aliases = getTexts(this.doc, 'data.aliases', 'name');
    const typeDocs = getDocs(this.doc, 'data.types', 'type', this.props.definitionDict);
    const subtypeDocs = getDocs(this.doc, 'data.subtypes', 'subtype', this.props.definitionDict);
    const descriptionMarkup = getMarkup(this.doc, 'data.description');
    const exampleMarkups = getMarkups(this.doc, 'data.examples', 'example');
    const referenceMarkups = getMarkups(this.doc, 'data.references', 'reference');
    const relatedDocs = getDocs(this.doc, 'data.related', 'fallacy', this.props.fallacyDict);

    return (
      <StyledRoot className={this.props.className} ref={this.props.nodeRef}>
        <StyledCloseButton
          symbol='-'
          tintColor={colors.black}
          hoverTintColor={colors.brown}
          onActivate={() => { if (this.props.docId) this.props.dismissFallacyById(this.props.docId); }}
        />

        <StyledAbbreviation>
          <Pixel alignment='tr' tintColor={colors.black}/>
          <Pixel alignment='br' tintColor={colors.black}/>
          <Pixel alignment='cr' tintColor={colors.black}/>
          <Pixel alignment='tc' tintColor={colors.black}/>
          <Pixel alignment='bc' tintColor={colors.black}/>
          <h2>{abbreviation || '--'}</h2>
        </StyledAbbreviation>

        <StyledSection>
          <StyledLabel>{ltxt('name')}</StyledLabel>
          <StyledContent>
            <StyledName>{name || '--'}</StyledName>
          </StyledContent>
        </StyledSection>

        <StyledSection>
          <StyledLabel>{ltxt('aliases')}</StyledLabel>
          <StyledContent>
            {aliases ? <em>{aliases.join(', ')}</em> : '--'}
          </StyledContent>
        </StyledSection>

        <StyledSection>
          <StyledLabel>{ltxt('types')}</StyledLabel>
          <StyledContent>
            {!typeDocs || typeDocs.length <= 0 ? '--' :
              <ul>
                {typeDocs.map((v, i) => (
                  <li key={`type=${i}`}><a onClick={this.onTypeSelect(v.id)}>{_.get(v, 'data.name')}</a></li>
                ))}
              </ul>
            }
          </StyledContent>
        </StyledSection>

        <StyledSection>
          <StyledLabel>{ltxt('subtypes')}</StyledLabel>
          <StyledContent>
            {!subtypeDocs || subtypeDocs.length <= 0 ? '--' :
              <ul>
                {subtypeDocs.map((v, i) => (
                  <li key={`subtype=${i}`}><a onClick={this.onTypeSelect(v.id)}>{_.get(v, 'data.name')}</a></li>
                ))}
              </ul>
            }
          </StyledContent>
        </StyledSection>

        <StyledSection>
          <StyledLabel>{ltxt('description')}</StyledLabel>
          <StyledContent>
            {descriptionMarkup ? <RichText markup={descriptionMarkup}/> : '--'}
          </StyledContent>
        </StyledSection>

        <StyledSection>
          <StyledLabel>{ltxt('examples')}</StyledLabel>
          <StyledContent>
            {!exampleMarkups || exampleMarkups.length <= 0 ? '--' :
              <ul>
                {exampleMarkups.map((v, i) => (
                  <li key={`example-${i}`}>
                    <RichText markup={v}/>
                  </li>
                ))}
              </ul>
            }
          </StyledContent>
        </StyledSection>

        <StyledSection>
          <StyledLabel>{ltxt('related')}</StyledLabel>
          <StyledContent>
            {!relatedDocs || relatedDocs.length <= 0 ? '--' :
              <ul>
                {relatedDocs.map((v: any, i) => (
                  <li key={`related-${i}`}>
                    <a onClick={() => this.props.presentFallacyById(v.id)}>{_.get(v, 'data.name')}</a>
                  </li>
                ))}
              </ul>
            }
          </StyledContent>
        </StyledSection>

        <StyledSection>
          <StyledLabel>{ltxt('references')}</StyledLabel>
          <StyledContent>
            {!referenceMarkups || referenceMarkups.length <= 0 ? '--' :
              <ul>
                {referenceMarkups.map((v, i) => (
                  <li key={`reference-${i}`} dangerouslySetInnerHTML={{ __html: v }}/>
                ))}
              </ul>
            }
          </StyledContent>
        </StyledSection>
      </StyledRoot>
    );
  }
}

const ConnectedFallacy = connect(
  (state: AppState): StateProps => ({
    definitionDict: state.definitions.docs[__I18N_CONFIG__.defaultLocale] || [],
    fallacyDict: state.fallacies.docs[__I18N_CONFIG__.defaultLocale] || [],
    i18n: state.i18n,
  }),
  (dispatch: Dispatch<Action>): DispatchProps => bindActionCreators({
    presentFallacyById,
    dismissFallacyById,
    presentDefinitionById,
  }, dispatch),
)(Fallacy);

export default forwardRef((props: OwnProps, ref: Ref<HTMLDivElement>) => <ConnectedFallacy {...props} nodeRef={ref}/>);

const StyledCloseButton = styled(ActionButton)`
  ${align.tl}
  margin: 3rem;
`;

const StyledContent = styled.div`
  padding: 1rem 1rem;
  width: 100%;
  max-width: 40rem;
  font-family: 'RobotoMono';
  font-weight: 400;
  font-size: 1.4rem;

  ul, ol {
    ${container.fvtl}
    width: 100%;
    margin: 0;
    padding: 0;

    li {
      margin-left: 3rem;
      max-width: 100%;
    }

    ${selectors.eblc} {
      margin-bottom: .5rem;
    }
  }

  ul li {
    list-style: square;
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
    background: ${(props) => props.theme.colors.lightGrey};
    padding: 1rem;
    margin: 0;
    width: 100%;
  }

  a {
    ${animations.transition('color', 200, 'ease-out')}
    color: ${(props) => props.theme.colors.brown};
    cursor: pointer;

    ${selectors.hwot} {
      color: ${(props) => props.theme.colors.brown};
      text-decoration: underline;
    }
  }
`;

const StyledLabel = styled.div`
  ${container.fhcl}
  background: ${(props) => props.theme.colors.black};
  color: ${(props) => props.theme.colors.white};
  font-family: 'NovaMono';
  font-size: 1.4rem;
  font-weight: 400;
  padding: .4rem 1rem;
  text-transform: uppercase;
  width: 100%;
`;

const StyledSection = styled.div`
  ${container.fvtl}
  margin-top: 2rem;
`;

const StyledAbbreviation = styled.div`
  ${container.fhcr}
  background: ${(props) => props.theme.colors.lightGrey};
  height: 20rem;
  padding: 0 1rem;
  width: 100%;

  h2 {
    color: ${(props) => props.theme.colors.black};
    font-family: 'NovaMono';
    width: 100%;
    font-size: 12rem;
    text-align: center;
  }
`;

const StyledName = styled.h1`
  font-family: 'RobotoMono';
  font-size: 1.6rem;
  font-weight: 700;
  line-height: 120%;
  text-transform: uppercase;
  width: 100%;
`;

const StyledRoot = styled.div`
  -webkit-overflow-scrolling: touch;
  background: ${(props) => props.theme.colors.white};
  color: ${(props) => props.theme.colors.black};
  overflow-y: scroll;
  padding: 8rem 3rem;
  user-select: text;
`;

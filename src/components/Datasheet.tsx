import _ from 'lodash';
import PrismicDOM from 'prismic-dom';
import { Document } from 'prismic-javascript/d.ts/documents';
import { align, animations, container, selectors } from 'promptu';
import React, { forwardRef, PureComponent, Ref } from 'react';
import { connect } from 'react-redux';
import { Action, bindActionCreators, Dispatch } from 'redux';
import styled from 'styled-components';
import { AppState } from '../store';
import { I18nState } from '../store/i18n';
import { reduceDocs } from '../store/prismic';
import { colors } from '../styles/theme';
import { linkResolver } from '../utils/prismic';
import ActionButton from './ActionButton';
import Pixel from './Pixel';

interface StateProps {
  i18n: I18nState;
  docs: ReadonlyArray<Document>;
  fallacyTypes: ReadonlyArray<Document>;
  fallacySubtypes: ReadonlyArray<Document>;
}

interface DispatchProps {

}

interface OwnProps {
  className?: string;
  docId?: string;
  nodeRef?: Ref<HTMLDivElement>;
  onDocChange: (docId: string) => void;
  onExit: () => void;
}

interface Props extends StateProps, DispatchProps, OwnProps {}

class Datasheet extends PureComponent<Props> {
  static defaultProps: Partial<Props> = {
    onDocChange: () => {},
    onExit: () => {},
  };

  get doc(): Document | undefined {
    if (!this.props.docId) return undefined;
    return _.find(this.props.docs, (v) => v.id === this.props.docId);
  }

  getAbbreviation(): string | undefined {
    const fragment = _.get(this.doc, 'data.abbreviation');
    return _.isEmpty(fragment) ? undefined : fragment;
  }

  getName(): string | undefined {
    const fragment = _.get(this.doc, 'data.name');
    return _.isEmpty(fragment) ? undefined : fragment;
  }

  getAliases(): ReadonlyArray<string> {
    const fragments = _.get(this.doc, 'data.aliases');
    const names = _.reduce(fragments, (out, curr: any) => {
      if (!_.isEmpty(curr.name)) out.push(curr.name);
      return out;
    }, Array<string>());

    return names;
  }

  getType(): Document | undefined {
    const docId = _.get(this.doc, 'data.type.id');
    if (!docId) return undefined;
    return _.find(this.props.fallacyTypes, { id: docId });
  }

  getSubtype(): Document | undefined {
    const docId = _.get(this.doc, 'data.subtype.id');
    if (!docId) return undefined;
    return _.find(this.props.fallacySubtypes, { id: docId });
  }

  getDescriptionMarkup(): string | undefined {
    const fragment = _.get(this.doc, 'data.description');
    if (_.isEmpty(fragment)) return undefined;
    return PrismicDOM.RichText.asHtml(fragment, linkResolver);
  }

  getExampleMarkups(): ReadonlyArray<string> {
    const fragments = _.reduce(_.get(this.doc, 'data.examples'), (out, curr: any) => {
      if (!_.isEmpty(curr.example)) out.push(curr.example);
      return out;
    }, Array<string>());
    const markups = _.map(fragments, (v) => PrismicDOM.RichText.asHtml(v, linkResolver));

    return markups;
  }

  getRelatedDocs(): ReadonlyArray<Document> {
    const fragments = _.get(this.doc, 'data.related');
    const docIds = _.reduce(fragments, (out, curr: any) => {
      const id = _.get(curr, 'fallacy.id');
      if (id) out.push(id);
      return out;
    }, Array<string>());
    const docs = _.intersectionWith(this.props.docs, docIds, (doc, id) => doc.id === id);

    return docs;
  }

  getReferencesMarkups(): ReadonlyArray<string> {
    const fragments = _.reduce(_.get(this.doc, 'data.references'), (out, curr: any) => {
      if (!_.isEmpty(curr.reference)) out.push(curr.reference);
      return out;
    }, Array<string>());
    const markups = _.map(fragments, (v) => PrismicDOM.RichText.asHtml(v, linkResolver));

    return markups;
  }

  render() {
    const { ltxt } = this.props.i18n;
    const abbreviation = this.getAbbreviation();
    const name = this.getName();
    const aliases = this.getAliases();
    const type = this.getType();
    const subtype = this.getSubtype();
    const descriptionMarkup = this.getDescriptionMarkup();
    const exampleMarkups = this.getExampleMarkups();
    const referenceMarkups = this.getReferencesMarkups();
    const relatedDocs = this.getRelatedDocs();

    return (
      <StyledRoot className={this.props.className} ref={this.props.nodeRef}>
        <StyledCloseButton
          symbol='-'
          tintColor={colors.black}
          hoverTintColor={colors.red}
          onActivate={() => this.props.onExit()}
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
            {aliases.length > 0 ? <em>{aliases.join(', ')}</em> : '--'}
          </StyledContent>
        </StyledSection>

        <StyledSection>
          <StyledLabel>{ltxt('type')}</StyledLabel>
          <StyledContent>
            {type ? <a>{_.get(type, 'data.name')}</a> : '--'} / {subtype ? <a>{_.get(subtype, 'data.name')}</a> : '--'}
          </StyledContent>
        </StyledSection>

        <StyledSection>
          <StyledLabel>{ltxt('description')}</StyledLabel>
          <StyledContent dangerouslySetInnerHTML={{ __html: descriptionMarkup || '--' }}/>
        </StyledSection>

        <StyledSection>
          <StyledLabel>{ltxt('examples')}</StyledLabel>
          <StyledContent>
            {exampleMarkups.length <= 0 ? '--' :
              <ul>
                {exampleMarkups.map((v, i) => (
                  <li key={`example-${i}`} dangerouslySetInnerHTML={{ __html: v }}/>
                ))}
              </ul>
            }
          </StyledContent>
        </StyledSection>

        <StyledSection>
          <StyledLabel>{ltxt('related')}</StyledLabel>
          <StyledContent>
            {relatedDocs.length <= 0 ? '--' :
              <ul>
                {relatedDocs.map((v: any, i) => (
                  <li key={`related-${i}`}>
                    <a onClick={() => this.props.onDocChange(v.id)}>{_.get(v, 'data.name')}</a>
                  </li>
                ))}
              </ul>
            }
          </StyledContent>
        </StyledSection>

        <StyledSection>
          <StyledLabel>{ltxt('references')}</StyledLabel>
          <StyledContent>
            {referenceMarkups.length <= 0 ? '--' :
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

const ConnectedDatasheet = connect(
  (state: AppState): StateProps => ({
    i18n: state.i18n,
    docs: reduceDocs(state.prismic, 'fallacy') || [],
    fallacyTypes: reduceDocs(state.prismic, 'fallacy_type') || [],
    fallacySubtypes: reduceDocs(state.prismic, 'fallacy_subtype') || [],
  }),
  (dispatch: Dispatch<Action>): DispatchProps => bindActionCreators({

  }, dispatch),
)(Datasheet);

export default forwardRef((props: OwnProps, ref: Ref<HTMLDivElement>) => <ConnectedDatasheet {...props} nodeRef={ref}/>);

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
      margin-bottom: 1rem;
    }
  }

  ul li {
    list-style: square;
  }

  p + pre,
  p + ol,
  p + ul {
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
    color: ${(props) => props.theme.colors.red};
    cursor: pointer;

    ${selectors.hwot} {
      color: ${(props) => props.theme.colors.red};
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

const StyledCloseButton = styled(ActionButton)`
  ${align.tl}
  margin: 3rem;
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

const StyledSection = styled.div`
  ${container.fvtl}
  margin-top: 2rem;
`;

const StyledRoot = styled.div`
  -webkit-overflow-scrolling: touch;
  background: #fff;
  color: ${(props) => props.theme.colors.black};
  overflow-y: scroll;
  padding: 8rem 3rem;
`;

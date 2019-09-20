import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock';
import _ from 'lodash';
import PrismicDOM from 'prismic-dom';
import { Document } from 'prismic-javascript/d.ts/documents';
import { align, animations, container, selectors } from 'promptu';
import React, { createRef, PureComponent } from 'react';
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

interface Props extends StateProps, DispatchProps {
  className?: string;
  id?: string;
  doc: Document;
  scrollLock: boolean;
  onExit: () => void;
}

class Datasheet extends PureComponent<Props> {
  static defaultProps: Partial<Props> = {
    scrollLock: false,
    onExit: () => {},
  };

  nodeRefs = {
    root: createRef<HTMLDivElement>(),
  };

  componentDidMount() {
    if (this.nodeRefs.root.current) {
      if (this.props.scrollLock) {
        disableBodyScroll(this.nodeRefs.root.current);
      }
      else {
        enableBodyScroll(this.nodeRefs.root.current);
      }
    }
  }

  componentWillUnmount() {
    if (this.nodeRefs.root.current) enableBodyScroll(this.nodeRefs.root.current);
  }

  componentDidUpdate(prevProps: Props) {
    if ((this.nodeRefs.root.current) && (prevProps.scrollLock !== this.props.scrollLock)) {
      if (this.props.scrollLock) {
        disableBodyScroll(this.nodeRefs.root.current);
      }
      else {
        enableBodyScroll(this.nodeRefs.root.current);
      }
    }
  }

  render() {
    const { ltxt } = this.props.i18n;
    const abbreviation = _.get(this.props.doc, 'data.abbreviation');
    const name = _.get(this.props.doc, 'data.name');
    const aliases = _.compact(_.map(_.get(this.props.doc, 'data.aliases'), ((v) => v.name)));
    const description = _.get(this.props.doc, 'data.description');
    const type = _.find(this.props.fallacyTypes, { id: _.get(this.props.doc, 'data.type.id') });
    const subtype = _.find(this.props.fallacySubtypes, { id: _.get(this.props.doc, 'data.subtype.id') });
    const references = _.map(_.get(this.props.doc, 'data.references'), (v) => v.reference);
    const hasReferences = _.get(references, '0.length') !== 0;
    const examples = _.map(_.get(this.props.doc, 'data.examples'), (v) => v.example);
    const hasExamples = _.get(examples, '0.length') !== 0;
    const related = _.intersectionWith(this.props.docs, _.map(_.get(this.props.doc, 'data.related'), (v) => v.fallacy), (a, b) => a.id === b.id);
    const hasRelated = related.length > 0;

    return (
      <StyledRoot id={this.props.id} className={this.props.className} ref={this.nodeRefs.root}>
        <StyledCloseButton
          symbol='-'
          tintColor={colors.black}
          hoverTintColor={colors.red}
          onActivate={() => this.props.onExit()}
        />

        {abbreviation &&
          <StyledAbbreviation>
            <Pixel alignment='tr' tintColor={colors.black}/>
            <Pixel alignment='br' tintColor={colors.black}/>
            <Pixel alignment='cr' tintColor={colors.black}/>
            <Pixel alignment='tc' tintColor={colors.black}/>
            <Pixel alignment='bc' tintColor={colors.black}/>
            <h2>{abbreviation}</h2>
          </StyledAbbreviation>
        }

        <section>
          <StyledLabel>{ltxt('name')}</StyledLabel>
          <StyledContent>
            {!_.isEmpty(name) &&
              <StyledName>{name}</StyledName> ||
              <StyledName>--</StyledName>
            }
          </StyledContent>
        </section>

        <section>
          <StyledLabel>{ltxt('aliases')}</StyledLabel>
          <StyledContent>
            {!_.isEmpty(aliases) &&
              <em>{aliases.join(', ')}</em> ||
              <em>--</em>
            }
          </StyledContent>
        </section>

        <section>
          <StyledLabel>{ltxt('type')}</StyledLabel>
          <StyledContent>{`${_.get(type, 'data.name', '--')} / ${_.get(subtype, 'data.name', '--')}`}</StyledContent>
        </section>

        <section>
          <StyledLabel>{ltxt('description')}</StyledLabel>
          <StyledContent>
            {!_.isEmpty(description) &&
              <StyledDescription dangerouslySetInnerHTML={{ __html: PrismicDOM.RichText.asHtml(description, linkResolver) }}/> ||
              <StyledDescription><p>--</p></StyledDescription>
            }
          </StyledContent>
        </section>

        <section>
          <StyledLabel>{ltxt('examples')}</StyledLabel>
          <StyledContent>
            {hasExamples && <StyledExampleList>
              {examples.map((v, i) => (
                <div key={`example-${i}`} dangerouslySetInnerHTML={{ __html: PrismicDOM.RichText.asHtml(v, linkResolver) || '--' }}/>
              ))}
            </StyledExampleList> ||
              <p>--</p>
            }
          </StyledContent>
        </section>

        <section>
          <StyledLabel>{ltxt('related')}</StyledLabel>
          <StyledContent>
            {hasRelated &&
              <StyledRelatedList>
                {related.map((v: any, i) => (
                  <li key={`related-${i}`}><a>{v.data.name}</a></li>
                ))}
              </StyledRelatedList> ||
              <p>--</p>
            }
          </StyledContent>
        </section>

        <section>
          <StyledLabel>{ltxt('references')}</StyledLabel>
          <StyledContent>
            {hasReferences && <StyledReferenceList>
              {references.map((v, i) => (
                <li key={`reference-${i}`} dangerouslySetInnerHTML={{ __html: PrismicDOM.RichText.asHtml(v, linkResolver) || '--' }}/>
              ))}
            </StyledReferenceList> ||
              <p>--</p>
            }
          </StyledContent>
        </section>
      </StyledRoot>
    );
  }
}

export default connect(
  (state: AppState): StateProps => ({
    i18n: state.i18n,
    docs: reduceDocs(state.prismic, 'fallacy') || [],
    fallacyTypes: reduceDocs(state.prismic, 'fallacy_type') || [],
    fallacySubtypes: reduceDocs(state.prismic, 'fallacy_subtype') || [],
  }),
  (dispatch: Dispatch<Action>): DispatchProps => bindActionCreators({

  }, dispatch),
)(Datasheet);

const StyledRelatedList = styled.ul`
  li {
    margin-left: 2rem;
    list-style: square;

    a {
      ${animations.transition('color', 200, 'ease-out')}
      color: inherit;

      ${selectors.hwot} {
        color: ${(props) => props.theme.colors.red};
        text-decoration: underline;
      }
    }
  }

  ${selectors.eblc} {
    margin-bottom: 1rem;
  }
`;

const StyledExampleList = styled.div`
  > div {
    ${container.box}
    background: ${(props) => props.theme.colors.lightGrey};
    padding: 1rem;
  }

  ${selectors.eblc} {
    margin-bottom: 1rem;
  }
`;

const StyledReferenceList = styled.ul`
  li {
    margin-left: 2rem;
    list-style: square;

    a {
      ${animations.transition('color', 200, 'ease-out')}
      color: inherit;

      ${selectors.hwot} {
        color: ${(props) => props.theme.colors.red};
        text-decoration: underline;
      }
    }
  }

  ${selectors.eblc} {
    margin-bottom: 1rem;
  }
`;

const StyledContent = styled.div`
  padding: 1rem 1rem;
  max-width: 40rem;
  font-family: 'RobotoMono';
  font-weight: 400;
  font-size: 1.4rem;
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

const StyledDescription = styled.div`
  p {
    font-size: 1.4rem;
    font-family: 'RobotoMono';
    font-weight: 400;
  }
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
  background: #fff;
  color: ${(props) => props.theme.colors.black};
  overflow-y: scroll;
  padding: 8rem 3rem;

  > section {
    ${container.fvtl}
    margin-top: 2rem;
  }
`;

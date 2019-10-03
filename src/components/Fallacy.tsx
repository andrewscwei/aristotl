import _ from 'lodash';
import { Document } from 'prismic-javascript/d.ts/documents';
import { animations, container, media, selectors } from 'promptu';
import React, { forwardRef, MouseEvent, PureComponent, Ref } from 'react';
import { connect } from 'react-redux';
import { Action, bindActionCreators, Dispatch } from 'redux';
import styled from 'styled-components';
import { getDefinitions, getFallacies } from '../selectors';
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
  definitions: ReadonlyArray<Document>;
  fallacies: ReadonlyArray<Document>;
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
  scrollTargetRef?: Ref<HTMLDivElement>;
  onPrev?: () => void;
  onNext?: () => void;
  onExit?: () => void;
}

interface Props extends StateProps, DispatchProps, OwnProps {}

class Fallacy extends PureComponent<Props> {
  get doc(): Document | undefined {
    if (!this.props.docId) return undefined;
    return _.find(this.props.fallacies, (v) => v.uid === this.props.docId);
  }

  onExit() {
    if (this.props.onExit) {
      this.props.onExit();
    }
    else if (this.props.docId) {
      this.props.dismissFallacyById(this.props.docId);
    }
  }

  onTypeSelect(docId: string) {
    return (event: MouseEvent) => {
      event.preventDefault();
      this.props.presentDefinitionById(docId);
    };
  }

  onFallacySelect(docId?: string) {
    return (event: MouseEvent) => {
      event.preventDefault();
      if (!docId) return;
      this.props.presentFallacyById(docId);
    };
  }

  render() {
    const { ltxt } = this.props.i18n;
    const abbreviation = getText(this.doc, 'data.abbreviation');
    const name = getText(this.doc, 'data.name');
    const aliases = _.sortBy(getTexts(this.doc, 'data.aliases', 'name'));
    const typeDocs = getDocs(this.doc, 'data.types', 'type', this.props.definitions);
    const subtypeDocs = getDocs(this.doc, 'data.subtypes', 'fallacy', this.props.fallacies);
    const inheritanceDocs = getDocs(this.doc, 'data.inheritance', 'fallacy', this.props.fallacies);
    const descriptionMarkup = getMarkup(this.doc, 'data.description');
    const exampleMarkups = _.sortBy(getMarkups(this.doc, 'data.examples', 'example'));
    const referenceMarkups = getMarkups(this.doc, 'data.references', 'reference');
    const relatedDocs = _.sortBy(getDocs(this.doc, 'data.related', 'fallacy', this.props.fallacies), 'data.name');

    return (
      <StyledRoot className={this.props.className}>
        <StyledHeader>
          <StyledCloseButton
            symbol='-'
            tintColor={colors.black}
            hoverTintColor={colors.red}
            onActivate={() => this.onExit()}
          />
          <div>
            <StyledPrevButton
              symbol='<'
              tintColor={colors.black}
              hoverTintColor={colors.red}
              isDisabled={this.props.onPrev === undefined}
              onActivate={() => this.props.onPrev && this.props.onPrev()}
            />
            <StyledNextButton
              symbol='>'
              tintColor={colors.black}
              hoverTintColor={colors.red}
              isDisabled={this.props.onNext === undefined}
              onActivate={() => this.props.onNext && this.props.onNext()}
            />
          </div>
        </StyledHeader>

        <StyledBody ref={this.props.scrollTargetRef}>
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
              {!aliases || aliases.length <= 0 ? '--' :
                <ul>
                  {aliases.map((v, i) => (
                    <li key={`alias=${i}`}><em>{v}</em></li>
                  ))}
                </ul>
              }
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
            <StyledLabel>{ltxt('inheritance')}</StyledLabel>
            <StyledContent>
              {!inheritanceDocs || inheritanceDocs.length <= 0 ? '--' :
                <ul>
                  {inheritanceDocs.map((v, i) => (
                    <li key={`inheritance=${i}`}><a onClick={this.onFallacySelect(v.uid)}>{_.get(v, 'data.name')}</a></li>
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
                    <li key={`subtype=${i}`}><a onClick={this.onFallacySelect(v.uid)}>{_.get(v, 'data.name')}</a></li>
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
                      <a onClick={() => this.props.presentFallacyById(v.uid)}>{_.get(v, 'data.name')}</a>
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
        </StyledBody>
      </StyledRoot>
    );
  }
}

const ConnectedFallacy = connect(
  (state: AppState): StateProps => ({
    definitions: getDefinitions(state),
    fallacies: getFallacies(state),
    i18n: state.i18n,
  }),
  (dispatch: Dispatch<Action>): DispatchProps => bindActionCreators({
    presentFallacyById,
    dismissFallacyById,
    presentDefinitionById,
  }, dispatch),
)(Fallacy);

export default forwardRef((props: OwnProps, ref: Ref<HTMLDivElement>) => <ConnectedFallacy {...props} scrollTargetRef={ref}/>);

const StyledCloseButton = styled(ActionButton)`

`;

const StyledPrevButton = styled(ActionButton)<{
  isDisabled: boolean;
}>`
  pointer-events: ${(props) => props.isDisabled ? 'none' : 'auto'};
  opacity: ${(props) => props.isDisabled ? 0.2 : 1.0};
`;

const StyledNextButton = styled(ActionButton)<{
  isDisabled: boolean;
}>`
  pointer-events: ${(props) => props.isDisabled ? 'none' : 'auto'};
  opacity: ${(props) => props.isDisabled ? 0.2 : 1.0};
`;

const StyledContent = styled.div`
  padding: 1rem 1rem;
  width: 100%;
  font-weight: 400;
  font-size: 1.4rem;

  ul,
  ol {
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
    background: ${(props) => props.theme.colors.lightGrey};
    line-height: 130%;
    margin: 0;
    padding: 1rem;
    white-space: pre-wrap;
    width: 100%;
    word-wrap: normal;
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
      opacity: .6;
    }
  }
`;

const StyledLabel = styled.div`
  ${container.fhcl}
  background: ${(props) => props.theme.colors.black};
  color: ${(props) => props.theme.colors.white};
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
    font-family: 'NovaMono', monospace;
    width: 100%;
    font-size: 10rem;
    text-align: center;

    @media ${media.gtw(400)} {
      font-size: 12rem;
    }
  }
`;

const StyledName = styled.h1`
  font-size: 1.6rem;
  font-weight: 700;
  line-height: 120%;
  text-transform: uppercase;
  width: 100%;
`;

const StyledHeader = styled.div`
  ${container.fhcs}
  margin: 3rem 0;
  padding: 0 1.4rem;
  width: 100%;

  > div {
    ${container.fhcl}
    ${selectors.eblc} {
      margin-right: 1rem;
    }
  }

  @media ${media.gtmobile} {
    padding: 0 3rem;
  }
`;

const StyledBody = styled.div`
  -webkit-overflow-scrolling: touch;
  color: ${(props) => props.theme.colors.black};
  flex: 1 1 auto;
  overflow-y: scroll;
  padding: 1rem 1.4rem 3rem;
  width: 100%;
  user-select: text;

  @media ${media.gtmobile} {
    padding: 1rem 3rem 3rem;
  }
`;

const StyledRoot = styled.div`
  ${container.fvtl}
  background: ${(props) => props.theme.colors.white};
  overflow: hidden;
`;

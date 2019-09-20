import _ from 'lodash';
import PrismicDOM from 'prismic-dom';
import { Document } from 'prismic-javascript/d.ts/documents';
import { align, container } from 'promptu';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Action, bindActionCreators, Dispatch } from 'redux';
import styled from 'styled-components';
import { AppState } from '../store';
import { I18nState } from '../store/i18n';
import { colors } from '../styles/theme';
import { linkResolver } from '../utils/prismic';
import ActionButton from './ActionButton';
import Pixel from './Pixel';

interface StateProps {
  i18n: I18nState;
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

  render() {
    console.log(this.props.doc);

    const { ltxt } = this.props.i18n;
    const abbreviation = _.get(this.props.doc, 'data.abbreviation');
    const name = _.get(this.props.doc, 'data.name');
    const aliases = _.compact(_.map(_.get(this.props.doc, 'data.aliases'), ((v) => v.name)));
    const description = _.get(this.props.doc, 'data.description');

    return (
      <StyledRoot id={this.props.id} className={this.props.className}>
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
          <StyledContent>
          </StyledContent>
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
          </StyledContent>
        </section>

        <section>
          <StyledLabel>{ltxt('related')}</StyledLabel>
          <StyledContent>
          </StyledContent>
        </section>

        <section>
          <StyledLabel>{ltxt('references')}</StyledLabel>
          <StyledContent>
          </StyledContent>
        </section>
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

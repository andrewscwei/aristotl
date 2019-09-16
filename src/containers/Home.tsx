import PrismicDOM from 'prismic-dom';
import { Document } from 'prismic-javascript/d.ts/documents';
import React, { Fragment, PureComponent } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Action, bindActionCreators, Dispatch } from 'redux';
import styled from 'styled-components';
import { AppState } from '../store';
import { I18nState } from '../store/i18n';
import { fetchDocs, reduceDoc } from '../store/prismic';
import { localeResolver } from '../utils/prismic';

interface StateProps {
  i18n: I18nState;
  doc?: Document;
}

interface DispatchProps {
  fetchDocs: typeof fetchDocs;
}

interface Props extends StateProps, DispatchProps, RouteComponentProps<{}> {}

interface State {

}

class Home extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.props.fetchDocs('home', undefined, {
      lang: localeResolver(this.props.i18n.locale),
    });
  }

  componentDidMount() {
    document.title = this.props.i18n.ltxt('home');
  }

  render() {
    return (
      <StyledRoot>
        { this.props.doc &&
          <Fragment>
            <h1>{PrismicDOM.RichText.asText(this.props.doc.data.title)}</h1>
            <p>v{__APP_CONFIG__.version} ({__APP_CONFIG__.buildNumber})</p>
            <p>{PrismicDOM.RichText.asText(this.props.doc.data.body)}</p>
          </Fragment>
        }
      </StyledRoot>
    );
  }
}

export default connect(
  (state: AppState): StateProps => ({
    i18n: state.i18n,
    doc: reduceDoc(state.prismic, 'home', undefined, state.i18n.locale),
  }),
  (dispatch: Dispatch<Action>): DispatchProps => bindActionCreators({
    fetchDocs,
  }, dispatch),
)(Home);

const StyledRoot = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  font-family: ${(props) => props.theme.font};
  height: 100%;
  justify-content: center;
  padding: 10% 5%;
  position: absolute;
  width: 100%;

  h1 {
    color: ${(props) => props.theme.titleColor};
    font-size: 5em;
    font-weight: 700;
    letter-spacing: 3px;
    margin: 0;
    max-width: 550px;
    text-align: center;
    text-transform: uppercase;
  }

  p {
    color: ${(props) => props.theme.textColor};
    font-weight: 400;
    letter-spacing: .6px;
    line-height: 1.6em;
    margin: 0;
    max-width: 400px;
    text-align: center;
  }
`;

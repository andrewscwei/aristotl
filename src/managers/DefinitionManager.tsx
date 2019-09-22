import { Document } from 'prismic-javascript/d.ts/documents';
import React, { Fragment, PureComponent, ReactNode } from 'react';
import { connect } from 'react-redux';
import { Action, bindActionCreators, Dispatch } from 'redux';
import { AppState } from '../store';
import { fetchAll } from '../store/definitions';

interface StateProps {
  docs: ReadonlyArray<Document>;
}

interface DispatchProps {
  fetchAll: typeof fetchAll;
}

interface Props extends StateProps, DispatchProps {
  children: (docs: ReadonlyArray<Document>) => ReactNode;
}

class DefinitionManager extends PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    this.props.fetchAll();
  }

  render() {
    return (
      <Fragment>
        {this.props.children(this.props.docs)}
      </Fragment>
    );
  }
}

export default connect(
  (state: AppState): StateProps => ({
    docs: state.definitions[__I18N_CONFIG__.defaultLocale] || [],
  }),
  (dispatch: Dispatch<Action>): DispatchProps => bindActionCreators({
    fetchAll,
  }, dispatch),
)(DefinitionManager);

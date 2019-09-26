import React, { Fragment, PureComponent } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { getPreviewPath, savePreviewToken } from '../utils/prismic';

const debug = (process.env.NODE_ENV === 'development' || __APP_CONFIG__.enableDebugInProduction === true) ? require('debug')('app:preview') : () => {};

interface Props extends RouteComponentProps<{}> {

}

class Preview extends PureComponent<Props> {
  constructor(props: Props) {
    super(props);

    const params = new URLSearchParams(props.location.search);
    const token = params.get('token');
    const documentId = params.get('documentId');

    if (token && documentId) {
      this.redirect(token);
      debug(`Initializing preview for document <${documentId}>...`, 'OK', token);
    }
    else {
      debug(`Initializing preview for document <${documentId}>...`, 'ERR', 'Missing token from query string');
    }
  }

  async redirect(token: string) {
    savePreviewToken(token);

    const path = await getPreviewPath(token);

    debug('Redirecting...', 'OK', path);

    this.props.history.push({
      pathname: path,
    });
  }

  render() {
    return (
      <Fragment/>
    );
  }
}

export default withRouter(Preview);

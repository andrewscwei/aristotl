import { SFC, useEffect } from 'react';
import { RouteComponentProps } from 'react-router';
import { getPreviewPath, savePreviewToken } from '../utils/prismic';

const debug = (process.env.NODE_ENV === 'development' || __APP_CONFIG__.enableDebugInProduction === true) ? require('debug')('app:preview') : () => {};

interface Props extends RouteComponentProps {}

const Preview: SFC<Props> = ({ location, history}) => {
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const documentId = params.get('documentId');

    if (token && documentId) {
      document.title = 'Previewing...';

      debug(`Previewing document <${documentId}>...`);

      savePreviewToken(token);

      getPreviewPath(token, documentId).then((path) => {
        history.push({
          pathname: path,
        });
      });
    }
  }, []);

  return null;
};

export default Preview;

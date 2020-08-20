import _ from 'lodash';
import qs from 'query-string';
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
      debug(`Previewing document <${documentId}>...`);

      savePreviewToken(token);

      getPreviewPath(token, documentId).then((path) => {
        const parsed = qs.parseUrl(path, { parseFragmentIdentifier: true });

        history.push({
          pathname: parsed.url,
          hash: parsed.fragmentIdentifier,
          search: _.isEmpty(params) ? undefined : `?${qs.stringify(parsed.query)}`
        });
      });
    }
  }, []);

  return null;
};

export default Preview;

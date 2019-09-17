/**
 * @file Route definitions for React router.
 */

import Home from '../containers/Home';
import NotFound from '../containers/NotFound';
import Preview from '../containers/Preview';

export default [{
  path: '/',
  exact: true,
  component: Home,
}, {
  path: '/preview',
  component: Preview,
}, {
  path: '*',
  component: NotFound,
}];

/**
 * @file Default web worker.
 */

const debug = process.env.NODE_ENV === 'development' ? require('debug')('worker:web') : () => {};
const ctx: Worker = self as any;

debug.enabled = process.env.NODE_ENV === 'development';

// Post data to parent thread
ctx.postMessage({ message: 'Hello, world!' });

// Respond to message from parent thread
ctx.addEventListener('message', (event) => {
  debug(event.data.message);
});

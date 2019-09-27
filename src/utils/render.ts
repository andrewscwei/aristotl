/* tslint:disable: no-console */

export function analyzeRenderCycle<P extends {}, S extends {} = {}>(oldProps: P, newProps: P, oldState?: S, newState?: S) {
  console.log('Checking prop changes...');

  for (const key in oldProps) {
    if (oldProps[key] !== newProps[key]) console.log(`Prop "${key}" is different`, oldProps[key], newProps[key]);
  }

  console.log('Checking prop changes...', 'OK');

  if (oldState && newState) {
    console.log('Checking state changes...');

    for (const key in oldState) {
      if (oldState[key] !== newState[key]) console.log(`State "${key}" is different`, oldState[key], newState[key]);
    }

    console.log('Checking state changes...', 'OK');
  }
}

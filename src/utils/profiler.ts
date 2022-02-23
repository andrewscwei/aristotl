const debug = (process.env.NODE_ENV === 'development' || __APP_CONFIG__.enableDebugInProduction === true) ? require('debug')('profiler') : () => {}

export function analyzeRenderCycle<P, S = unknown>(oldProps: P, newProps: P, oldState?: S, newState?: S) {
  debug('Checking prop changes...')

  for (const key in oldProps) {
    if (oldProps[key] !== newProps[key]) debug(`Prop "${key}" is different`, oldProps[key], newProps[key])
  }

  debug('Checking prop changes...', 'OK')

  if (oldState && newState) {
    debug('Checking state changes...')

    for (const key in oldState) {
      if (oldState[key] !== newState[key]) debug(`State "${key}" is different`, oldState[key], newState[key])
    }

    debug('Checking state changes...', 'OK')
  }
}

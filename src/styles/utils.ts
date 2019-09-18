import { TransitionStatus } from 'react-transition-group/Transition';

export function timeoutByTransitionStatus(value: number, autoMount: boolean = false) {
  if (autoMount) {
    return {
      appear: 0,
      enter: 0,
      exit: value,
    };
  }
  else {
    return value;
  }
}

export function valueByTransitionStatus(transitionStatus: TransitionStatus, values: Array<any>, autoMount: boolean = false): any {
  switch (values.length) {
  case 1: {
    switch (transitionStatus) {
    case 'entering': return values[0];
    case 'entered': return values[0];
    case 'exiting': return values[0];
    case 'exited': return values[0];
    }
  }
  case 2: {
    if (autoMount) {
      switch (transitionStatus) {
      case 'entering': return values[0];
      case 'entered': return values[1];
      case 'exiting': return values[0];
      case 'exited': return values[0];
      }
    }
    else {
      switch (transitionStatus) {
      case 'entering': return values[1];
      case 'entered': return values[1];
      case 'exiting': return values[0];
      case 'exited': return values[0];
      }
    }
  }
  case 4: {
    switch (transitionStatus) {
    case 'entering': return values[2];
    case 'entered': return values[3];
    case 'exiting': return values[0];
    case 'exited': return values[1];
    }
  }
  default:
    throw new Error('Invalid number of values provided');
  }
}

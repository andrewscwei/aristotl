import React, { PureComponent, ReactNode } from 'react';
import Hammer from 'react-hammerjs';

interface Props {
  isEnabled: boolean;
  children?: ReactNode;
  onPrev: () => void;
  onNext: () => void;
}

class NavControlManager extends PureComponent<Props> {
  static defaultProps: Partial<Props> = {
    isEnabled: false,
    onPrev: () => {},
    onNext: () => {},
  };

  componentDidMount() {
    window.addEventListener('keyup', this.onKeyUp);
  }

  componentWillUnmount() {
    window.removeEventListener('keyup', this.onKeyUp);
  }

  onKeyUp = (event: KeyboardEvent) => {
    if (!this.props.isEnabled) return;

    switch (event.keyCode) {
      case 39:
        this.props.onNext();
        break;
      case 37:
        this.props.onPrev();
        break;
    }
  }

  onSwipe = (direction: number) => {
    if (!this.props.isEnabled) return;

    switch (direction) {
    case 2: // Left
      this.props.onNext();
      break;
    case 4: // Right
      this.props.onPrev();
    }
  }

  render() {
    return (
      <Hammer direction='DIRECTION_HORIZONTAL' onSwipe={(event) => this.onSwipe(event.direction)}>
        {this.props.children}
      </Hammer>
    );
  }
}

export default NavControlManager;

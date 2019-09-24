import { animations, container, selectors } from 'promptu';
import React, { PureComponent } from 'react';
import styled from 'styled-components';
import Pixel from './Pixel';

interface Props {
  className?: string;
  id?: string;
  subtotalResultsStart: number;
  subtotalResultsEnd: number;
  totalResults: number;
  totalFormals: number;
  totalInformals: number;
  totalAlphas: number;
  totalBetas: number;
  totalGammas: number;
  onToggleFormals: (enabled: boolean) => void;
  onToggleInformals: (enabled: boolean) => void;
  onToggleAlphas: (enabled: boolean) => void;
  onToggleBetas: (enabled: boolean) => void;
  onToggleGammas: (enabled: boolean) => void;
}

interface State {
  areFormalsEnabled: boolean;
  areInformalsEnabled: boolean;
  areAlphasEnabled: boolean;
  areBetasEnabled: boolean;
  areGammasEnabled: boolean;
}

class Statistics extends PureComponent<Props, State> {
  static defaultProps: Partial<Props> = {
    subtotalResultsStart: 0,
    subtotalResultsEnd: 0,
    totalResults: 0,
    totalFormals: 0,
    totalInformals: 0,
    totalAlphas: 0,
    totalBetas: 0,
    totalGammas: 0,
    onToggleFormals: () => {},
    onToggleInformals: () => {},
    onToggleAlphas: () => {},
    onToggleBetas: () => {},
    onToggleGammas: () => {},
  };

  state: State = {
    areFormalsEnabled: true,
    areInformalsEnabled: true,
    areAlphasEnabled: true,
    areBetasEnabled: true,
    areGammasEnabled: true,
  };

  componentDidMount() {
    this.componentDidUpdate(this.props, {} as any);
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevState.areFormalsEnabled !== this.state.areFormalsEnabled) this.props.onToggleFormals(this.state.areFormalsEnabled);
    if (prevState.areInformalsEnabled !== this.state.areInformalsEnabled) this.props.onToggleInformals(this.state.areInformalsEnabled);
    if (prevState.areAlphasEnabled !== this.state.areAlphasEnabled) this.props.onToggleAlphas(this.state.areAlphasEnabled);
    if (prevState.areBetasEnabled !== this.state.areBetasEnabled) this.props.onToggleBetas(this.state.areBetasEnabled);
    if (prevState.areGammasEnabled !== this.state.areGammasEnabled) this.props.onToggleGammas(this.state.areGammasEnabled);
  }

  render() {
    return (
      <StyledRoot id={this.props.id} className={this.props.className}>
        <StyledCount>
          {(this.props.subtotalResultsStart === 0 || this.props.subtotalResultsEnd === 0 || this.props.totalResults === 0) &&
            <span>--</span>
            ||
            <span>{this.props.subtotalResultsStart}-{this.props.subtotalResultsEnd} / {this.props.totalResults}</span>
          }
        </StyledCount>
        <StyledFilterButton isActive={this.state.areFormalsEnabled} onClick={() => this.setState({ areFormalsEnabled: !this.state.areFormalsEnabled })}>
          <Pixel size={6} isHollow={false}/>
          <span>{this.props.totalFormals === 0 ? '--' : this.props.totalFormals}</span>
        </StyledFilterButton>
        <StyledFilterButton isActive={this.state.areInformalsEnabled} onClick={() => this.setState({ areInformalsEnabled: !this.state.areInformalsEnabled })}>
          <Pixel size={6} isHollow={true}/>
          <span>{this.props.totalInformals === 0 ? '--' : this.props.totalInformals}</span>
        </StyledFilterButton>
        <StyledFilterButton isActive={this.state.areAlphasEnabled} onClick={() => this.setState({ areAlphasEnabled: !this.state.areAlphasEnabled })}>
          <span>α</span>
          <span>{this.props.totalAlphas === 0 ? '--' : this.props.totalAlphas}</span>
        </StyledFilterButton>
        <StyledFilterButton isActive={this.state.areBetasEnabled} onClick={() => this.setState({ areBetasEnabled: !this.state.areBetasEnabled })}>
          <span>β</span>
          <span>{this.props.totalBetas === 0 ? '--' : this.props.totalBetas}</span>
        </StyledFilterButton>
        <StyledFilterButton isActive={this.state.areGammasEnabled} onClick={() => this.setState({ areGammasEnabled: !this.state.areGammasEnabled })}>
          <span>𝛾</span>
          <span>{this.props.totalGammas === 0 ? '--' : this.props.totalGammas}</span>
        </StyledFilterButton>
      </StyledRoot>
    );
  }
}

export default Statistics;

const StyledCount = styled.div`
  ${container.fhcl}
  font-family: 'RobotoMono';
  font-size: 1.4rem;
  font-weight: 400;
  color: ${(props) => props.theme.colors.white};

  > * {
    flex: 0 0 auto;
  }

  ${selectors.eblc} {
    margin-right: .6rem;
  }
`;

const StyledFilterButton = styled.button<{
  isActive: boolean;
}>`
  ${container.fhcl}
  ${animations.transition('opacity', 200, 'ease-out')}
  font-family: 'RobotoMono';
  font-size: 1.4rem;
  font-weight: 400;
  color: ${(props) => props.theme.colors.white};
  opacity: ${(props) => props.isActive ? 1.0 : 0.4};

  > * {
    flex: 0 0 auto;
  }

  ${selectors.eblc} {
    margin-right: .6rem;
  }

  ${selectors.hwot} {
    opacity: ${(props) => props.isActive ? 0.6 : 1.0};
  }
`;

const StyledRoot = styled.div`
  ${container.fhcl}
  flex-wrap: wrap;

  ${selectors.eblc} {
    margin-right: 3rem;
  }

  > * {
    flex: 0 0 auto;
  }
`;

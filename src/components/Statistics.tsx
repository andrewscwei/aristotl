import { animations, container, selectors } from 'promptu';
import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { colors } from '../styles/theme';
import Pixel from './Pixel';

interface Props {
  className?: string;
  id?: string;
  subtotalResultsStart: number;
  subtotalResultsEnd: number;
  totalResults: number;
  totalFormal: number;
  totalInformal: number;
}

class Statistics extends PureComponent<Props> {
  static defaultProps: Partial<Props> = {
    subtotalResultsStart: 0,
    subtotalResultsEnd: 0,
    totalResults: 0,
    totalFormal: 0,
    totalInformal: 0,
  };

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
        <StyledCount>
          <Pixel size={6} isHollow={false}/>
          <span>{this.props.totalFormal}</span>
        </StyledCount>
        <StyledCount>
          <Pixel size={6} isHollow={true}/>
          <span>{this.props.totalInformal}</span>
        </StyledCount>
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

  ${selectors.eblc} {
    margin-right: .6rem;
  }
`;

const StyledRoot = styled.div`
  ${container.fhcc}

  ${selectors.eblc} {
    margin-right: 3rem;
  }
`;

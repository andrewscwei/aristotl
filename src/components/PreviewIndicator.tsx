import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { removePreviewToken } from '../utils/prismic';

interface Props {

}

class PreviewIndicator extends PureComponent<Props> {
  render() {
    return (
      <StyledRoot onClick={() => this.exitPreview()}>
        <StyledIcon viewBox='0 0 256 256' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlnsXlink='http://www.w3.org/1999/xlink' xmlSpace='preserve' style={{ fillRule: 'evenodd', clipRule: 'evenodd', strokeLinejoin: 'round', strokeMiterlimit: 2 }}>
          <g transform='matrix(11.3224,0,0,11.3224,-16039.9,-3563.66)'>
            <path d='M1427.96,321.096C1431.04,321.096 1434.06,322.805 1436.73,326.049C1434.06,329.292 1431.04,331 1427.96,331C1424.87,331 1421.85,329.292 1419.19,326.049C1421.85,322.805 1424.87,321.096 1427.96,321.096ZM1427.96,333C1431.88,333 1435.63,330.807 1438.8,326.656L1439.26,326.049L1438.8,325.442C1435.63,321.291 1431.88,319.096 1427.96,319.096C1424.03,319.096 1420.28,321.291 1417.12,325.442L1416.65,326.049L1417.12,326.655C1420.28,330.807 1424.03,333 1427.96,333Z' style={{ fillRule: 'nonzero' }}/>
          </g>
          <g transform='matrix(11.3224,0,0,11.3224,-16039.9,-3563.66)'>
            <path d='M1427.91,324.096C1429.01,324.096 1429.91,324.994 1429.91,326.096C1429.91,327.199 1429.01,328.096 1427.91,328.096C1426.81,328.096 1425.91,327.199 1425.91,326.096C1425.91,324.994 1426.81,324.096 1427.91,324.096ZM1427.91,330.096C1430.12,330.096 1431.91,328.302 1431.91,326.096C1431.91,323.891 1430.12,322.096 1427.91,322.096C1425.7,322.096 1423.91,323.891 1423.91,326.096C1423.91,328.302 1425.7,330.096 1427.91,330.096Z' style={{ fillRule: 'nonzero' }}/>
          </g>
        </StyledIcon>
        <span>
          <StyledIcon viewBox='0 0 256 256' version='1.1' xmlns='http://www.w3.org/2000/svg' xmlnsXlink='http://www.w3.org/1999/xlink' xmlSpace='preserve' style={{ fillRule: 'evenodd', clipRule: 'evenodd', strokeLinejoin: 'round', strokeMiterlimit: 2 }}>
            <g transform='matrix(1,0,0,1,218.51,37.4907)'>
              <path d='M0,181.019C-1.972,182.991 -5.167,182.991 -7.139,181.019L-181.019,7.138C-182.991,5.167 -182.991,1.971 -181.019,0C-179.048,-1.972 -175.852,-1.972 -173.881,0L0,173.88C1.972,175.852 1.972,179.047 0,181.019' style={{ fillRule: 'nonzero' }}/>
            </g>
            <g transform='matrix(1,0,0,1,218.51,211.371)'>
              <path d='M0,-166.742L-173.881,7.139C-175.852,9.11 -179.048,9.11 -181.019,7.139C-182.991,5.167 -182.991,1.971 -181.019,-0L-7.139,-173.881C-5.167,-175.852 -1.972,-175.852 0,-173.881C1.972,-171.909 1.972,-168.714 0,-166.742' style={{ fillRule: 'nonzero' }}/>
            </g>
          </StyledIcon>
        </span>
      </StyledRoot>
    );
  }

  private exitPreview() {
    removePreviewToken();
    location.reload();
  }
}

export default PreviewIndicator;

const StyledIcon = styled.svg`
  width: 30px !important;
  height: 30px !important;
  position: absolute;
  margin: auto;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;

  * {
    fill: #fff;
  }
`;

const StyledRoot = styled.button`
  background: #c61313;
  border-radius: 50px;
  border: 0;
  cursor: pointer;
  height: 50px;
  left: 20px;
  outline: 0;
  overflow: hidden;
  pointer-events: auto;
  position: fixed;
  top: 20px;
  width: 50px;
  z-index: 10000;

  > span {
    background: rgba(0, 0, 0, .6);
    border-radius: inherit;
    height: 100%;
    left: 0;
    opacity: 0;
    position: absolute;
    top: 0;
    transform: scale(1.2);
    transition: all .2s ease-out;
    width: 100%;
  }

  &:hover {
    > span {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

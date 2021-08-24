import styled, { keyframes } from 'styled-components'
import { HeightAndWidthProps } from '../../generalInterfaces'

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }`

export const Loader = styled.div<HeightAndWidthProps>`
  width: ${(props) => (props.width ? `${props.width + 20}px` : '80px')};
  height: ${(props) => (props.height ? `${props.height + 20}px` : '80px')};
  margin: auto;
  &:after {
    content: ' ';
    display: block;
    width: ${(props) => (props.width ? `${props.width}px` : '64px')};
    height: ${(props) => (props.height ? `${props.height}px` : '64px')};
    border-radius: 50%;
    border: 6px solid #fff;
    border-color: #fff transparent #fff transparent;
    animation: ${rotate} 1.2s linear infinite;
  }
`
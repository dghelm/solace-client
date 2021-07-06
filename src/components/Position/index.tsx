import styled from 'styled-components'
import { GeneralTextProps, GeneralTextCss } from '../Text'

export const PositionCardLogo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

export const PositionCardName = styled.div`
  margin-top: 6px;
  font-weight: 600;
  text-align: center;
`

export const PositionCardCount = styled.div<GeneralTextProps>`
  margin-top: 10px;
  line-height: 33px;
  ${GeneralTextCss}
`

export const PositionCardButton = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: center;
  margin-top: 16px;
`

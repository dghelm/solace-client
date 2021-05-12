import React from 'react'
import styled from 'styled-components'

const OuterDiv = styled.div`
  height: 100px;
  border: 1px solid #4287f5;
  border-radius: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
`

const InnerDiv = styled.div`
  height: 70px;
  width: 725px;
  display: flex;
  flex-direction: row;
  border: 1px solid green;
  border-radius: 20px;
`
const TableDiv = styled.div`
  height: 70px;
  border-radius: 20px;
  border: 1px solid yellow;
  display: flex;
  flex-direction: column;
`

const TopDiv = styled.div`
  height: 20px;
  border: 1px solid black;
  display: flex;
  flex-direction: row;
  text-align: center;
`

const BotDiv = styled.div`
  height: 50px;
  border: 1px solid green;
  background-color: Aquamarine;
  border-radius: 20px;
  display: flex;
  flex-direction: row;
  text-align: center;
`

const ButtonDiv = styled.div`
  width: 100px;
  height: 70px;
  border: 1px solid purple;
`
const NameDiv = styled.div`
  width: 125px;
  height: 20px;
`
const ContentDiv = styled.div`
  width: 125px;
  height: 50px;
`
const InvestButton = styled.div`
  height: 25px;
  width: 80px;
  border-radius: 20px;
  border: 1px solid green;
  background-color: blue;
  &:hover {
    background-color: yellow;
  }
`
interface props {
  names: string[]
  content: any
}

const InvestTabPoolView: React.FC<props> = ({ names, content }) => {
  return (
    <OuterDiv>
      <InnerDiv>
        <TableDiv>
          <TopDiv>
            {names.map((name: string, i: number) => (
              <NameDiv key={i}>{name}</NameDiv>
            ))}
          </TopDiv>
          <BotDiv>
            {content.map((info: any, i: number) => (
              <ContentDiv key={i}>{info}</ContentDiv>
            ))}
          </BotDiv>
        </TableDiv>
        {/* <ButtonDiv>
          <InvestButton>INVEST</InvestButton>
        </ButtonDiv> */}
      </InnerDiv>
    </OuterDiv>
  )
}

export default InvestTabPoolView
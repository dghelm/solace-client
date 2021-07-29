import React, { useState } from 'react'
import { SidebarItem, ItemText, ItemList, TopNav, NavButton } from '.'
import { Logo } from '../Logo/Logo'
import { StyledMenu } from '../Icon'

const SidebarItemList: React.FC = ({ children }) => {
  return (
    <ItemList>
      {React.Children.map(children, (child: any) => (
        <ItemText>{child}</ItemText>
      ))}
    </ItemList>
  )
}

export const SideNavbar: React.FC = () => {
  return (
    <nav>
      <div style={{ position: 'fixed' }}>
        <Logo />
        <SidebarItemList>
          <SidebarItem to={'/'}>Dashboard</SidebarItem>
          <SidebarItem to={'/invest'}>Invest</SidebarItem>
          <SidebarItem to={'/quote'}>Buy Cover</SidebarItem>
          <SidebarItem to={'/govern'}>Govern</SidebarItem>
        </SidebarItemList>
      </div>
    </nav>
  )
}

export const TopNavbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  document.addEventListener('scroll', function (e) {
    setIsOpen(false)
  })

  return (
    <TopNav isOpen={isOpen}>
      <Logo />
      <ItemList>
        <SidebarItem onClick={() => setIsOpen(!isOpen)} to={'/'}>
          Dashboard
        </SidebarItem>
        <SidebarItem onClick={() => setIsOpen(!isOpen)} to={'/invest'}>
          Invest
        </SidebarItem>
        <SidebarItem onClick={() => setIsOpen(!isOpen)} to={'/quote'}>
          Buy Cover
        </SidebarItem>
        <SidebarItem onClick={() => setIsOpen(!isOpen)} to={'/govern'}>
          Govern
        </SidebarItem>
      </ItemList>
      <NavButton onClick={() => setIsOpen(!isOpen)}>
        <StyledMenu />
      </NavButton>
    </TopNav>
  )
}

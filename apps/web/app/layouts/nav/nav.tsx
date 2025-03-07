import { styled } from 'leather-styles/jsx';

import { NavItem } from './nav-item.layout';

export function Nav() {
  return (
    <styled.nav
      display="flex"
      flexDirection="column"
      minWidth="148px"
      borderColor="ink.border-default"
      borderRight="1px solid"
      minHeight="fit-content"
    >
      <styled.svg
        flexShrink={0}
        m="space.04"
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g id="Leather logotype">
          <g clipPath="url(#clip0_2605_28986)">
            <rect id="Rectangle 6925" width="32" height="32" fill="#12100F" />
            <path
              id="Vector"
              d="M18.7295 13.1775C20.6194 12.8849 23.3524 10.8948 23.3524 9.34372C23.3524 8.87546 22.9745 8.55354 22.422 8.55354C21.3753 8.55354 19.6018 10.1339 18.7295 13.1775ZM9.97801 20.8745C7.50665 20.8745 7.30313 23.3328 9.77449 23.3328C10.8793 23.3328 12.2168 22.8938 12.9146 22.1036C11.897 21.2257 11.0538 20.8745 9.97801 20.8745ZM25.7075 19.8209C25.8529 23.9474 23.7595 26.2594 20.2124 26.2594C18.119 26.2594 17.0723 25.4692 14.8335 24.0059C13.6705 25.2936 11.4608 26.2594 9.62912 26.2594C3.31988 26.2594 3.58155 18.2113 10.0071 18.2113C11.3445 18.2113 12.4785 18.5625 13.9322 19.4697L14.8917 16.1041C10.9375 15.0213 8.9604 11.9776 10.9084 7.61703H14.0485C12.304 10.5144 13.4961 12.9141 15.7058 13.1775C16.8978 8.93399 19.4564 5.62695 22.8582 5.62695C24.7771 5.62695 26.289 6.88538 26.289 9.16812C26.289 12.8264 21.5207 15.8115 17.9154 16.1041L16.4326 21.3427C18.119 23.3035 22.8 25.2058 22.8 19.8209H25.7075Z"
              fill="#F7F5F3"
            />
          </g>
        </g>
        <defs>
          <clipPath id="clip0_2605_28986">
            <rect width="32" height="32" rx="2" fill="white" />
          </clipPath>
        </defs>
      </styled.svg>

      <styled.div mt="space.06" mb="space.06">
        <NavItem href="/" icon="house">
          Home
        </NavItem>

        <NavItem href="/earn" icon="pulse">
          Earn
        </NavItem>

        <NavItem href="/send" icon="paper-plane">
          Send
        </NavItem>

        <NavItem href="/receive" icon="inbox">
          Receive
        </NavItem>

        <NavItem href="/swap" icon="arrows-repeat-left-right">
          Swap
        </NavItem>
      </styled.div>

      <styled.div mt="auto" mb="space.09">
        <NavItem href="/blog" icon="newspaper">
          Blog
        </NavItem>

        <NavItem href="/guides" icon="glasses">
          Guides
        </NavItem>

        <NavItem href="/dev-docs" icon="terminal">
          Dev Docs
        </NavItem>

        <NavItem href="/support" icon="support">
          Support
        </NavItem>
      </styled.div>
    </styled.nav>
  );
}

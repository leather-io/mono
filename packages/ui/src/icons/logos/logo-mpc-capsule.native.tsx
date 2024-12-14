import { Component, forwardRef } from 'react';
import { SvgProps } from 'react-native-svg';

import LogoMpcCapsuleLogo from '../../assets/icons/logos/logo-mpc-capsule-24-24.svg';
import { Icon } from '../icon/icon.native';

export const LogoMpcCapsule = forwardRef<Component, SvgProps>((props, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <LogoMpcCapsuleLogo />
    </Icon>
  );
});

LogoMpcCapsule.displayName = 'LogoMpcCapsule';

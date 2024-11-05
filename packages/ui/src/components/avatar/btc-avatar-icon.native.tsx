import BtcIcon from '../../assets/icons/bitcoin.svg';
import { Icon } from '../../icons/icon/icon.native';
import { Avatar } from './avatar.native';

export function BtcAvatarIcon() {
  return (
    <Avatar bg="ink.background-primary" p="0">
      <Icon>
        <BtcIcon />
      </Icon>
    </Avatar>
  );
}

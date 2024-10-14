import { Tab, TabBar } from '../tab-bar';
import { HeaderBackButton } from './components/header-back-button';
import { HeaderTitle } from './components/header-title';
import { HeaderLayout } from './header.layout';

interface TabsHeaderProps {
  onGoBack(): void;
  rightElement?: React.ReactNode;
  tabs: Tab[];
  title: string;
}
export function TabsHeader({ onGoBack, rightElement, tabs, title }: TabsHeaderProps) {
  return (
    <HeaderLayout
      leftElement={<HeaderBackButton onPress={onGoBack} />}
      centerElement={<HeaderTitle title={title} />}
      rightElement={rightElement}
      bottomElement={<TabBar tabs={tabs} />}
    />
  );
}

import { type HTMLStyledProps, styled } from 'leather-styles/jsx';

export function HomeCard(props: HTMLStyledProps<'div'>) {
  return <styled.div borderRadius="md" p="space.04" {...props} />;
}

export function HomeHeroCard(props: HTMLStyledProps<'div'>) {
  return (
    <HomeCard background="linear-gradient(261deg, #FFCAC7 28.46%, #FFC484 99.71%)" {...props} />
  );
}

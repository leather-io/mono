import { type HTMLStyledProps, styled } from 'leather-styles/jsx';

/** Small outlined chip used next to card titles ("Mobile", "Extension") and on changelog cards. */
export function MarketingTag(props: HTMLStyledProps<'span'>) {
  return (
    <styled.span
      display="inline-flex"
      alignItems="center"
      height="24px"
      px="space.02"
      border="1px solid"
      borderColor="ink.border-default"
      borderRadius="round"
      color="ink.text-subdued"
      textStyle="caption.02"
      whiteSpace="nowrap"
      verticalAlign="middle"
      {...props}
    />
  );
}

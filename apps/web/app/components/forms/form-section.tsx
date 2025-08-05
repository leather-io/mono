import { HTMLStyledProps, styled } from 'leather-styles/jsx';

interface FormSectionProps extends HTMLStyledProps<'fieldset'> {
  title?: string;
  description?: string;
}
export function FormSection({ children, title, description, ...props }: FormSectionProps) {
  return (
    <styled.fieldset display="flex" flexDir="column" mb="space.06" {...props}>
      {title && <FormSection.Title>{title}</FormSection.Title>}
      {description && <FormSection.Description>{description}</FormSection.Description>}
      {children}
    </styled.fieldset>
  );
}

function FormSectionTitle(props: HTMLStyledProps<'legend'>) {
  return <styled.legend textStyle="label.01" mb="space.01" {...props} />;
}

function FormSectionDescription(props: HTMLStyledProps<'p'>) {
  return <styled.p textStyle="caption.01" mb="space.02" {...props} />;
}

FormSection.Title = FormSectionTitle;
FormSection.Description = FormSectionDescription;

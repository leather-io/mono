import DomPurify from 'dompurify';
import { Box } from 'leather-styles/jsx';

interface InscriptionTextLayoutProps {
  content: string;
}
export function InscriptionTextLayout({ content }: InscriptionTextLayoutProps) {
  return (
    <Box
      _after={{
        content: '""',
        position: 'absolute',
        bottom: '0',
        left: '0',
        height: '30px',
        width: '100%',
        backgroundImage: 'linear-gradient(rgba(0,0,0,0), rgba(0,0,0,1))',
      }}
      color="white"
      fontSize="9px"
      height="100%"
      p="space.03"
      position="relative"
      overflow="hidden"
      textAlign="left"
      width="100%"
    >
      <pre>{DomPurify.sanitize(content)}</pre>
    </Box>
  );
}

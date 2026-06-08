import { Box } from 'leather-styles/jsx';

interface FauxQRProps {
  text: string;
  size?: number;
}

const GRID = 11;

// Decorative, deterministic faux QR derived from the text — design fidelity
// only. Production extraction swaps in a real QR library.
export function FauxQR({ text, size = 132 }: FauxQRProps) {
  let seed = 0;
  for (let i = 0; i < text.length; i++) seed = (seed * 31 + text.charCodeAt(i)) >>> 0;

  const cells: boolean[] = [];
  for (let i = 0; i < GRID * GRID; i++) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    const row = Math.floor(i / GRID);
    const col = i % GRID;
    const finder =
      (row < 3 && col < 3) || (row < 3 && col > GRID - 4) || (row > GRID - 4 && col < 3);
    cells.push(finder || ((seed >> 17) & 1) === 1);
  }

  return (
    <Box
      width={`${size}px`}
      height={`${size}px`}
      display="grid"
      gridTemplateColumns={`repeat(${GRID}, 1fr)`}
      gridTemplateRows={`repeat(${GRID}, 1fr)`}
      gap="1px"
      p="space.02"
      bg="white"
      borderRadius="sm"
      borderWidth="1px"
      borderStyle="solid"
      borderColor="ink.border-default"
    >
      {cells.map((on, i) => (
        <Box key={i} bg={on ? 'ink.text-primary' : 'transparent'} borderRadius="1px" />
      ))}
    </Box>
  );
}

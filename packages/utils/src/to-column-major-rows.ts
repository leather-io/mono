// Reorders items into column-major order so columns stay sorted after chunking into rows.
export function toColumnMajorRows(rowSize: number) {
  return <T>(arr: T[]): T[] => {
    const numRows = Math.ceil(arr.length / rowSize);
    return Array.from({ length: numRows }, (_, row) =>
      arr.filter((_, i) => i % numRows === row)
    ).flat();
  };
}

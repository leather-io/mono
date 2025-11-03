type ColumnAlignment = 'left' | 'center' | 'right';
export function getJustifyContent(alignment: ColumnAlignment) {
  if (alignment === 'right') {
    return 'flex-end';
  } else if (alignment === 'center') {
    return 'center';
  } else {
    return 'flex-start';
  }
}

export type SortState = 'asc' | 'desc' | false;
export function getAriaSort(sortState: SortState) {
  if (sortState === 'asc') {
    return 'ascending';
  } else if (sortState === 'desc') {
    return 'descending';
  } else {
    return 'none';
  }
}

export function paginateItems<T>(
  items: T[],
  page: number,
  pageSize: number,
): T[] {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return items.slice(startIndex, endIndex);
}

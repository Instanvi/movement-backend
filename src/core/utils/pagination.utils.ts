import { PaginatedDataDto } from '../dto/response.dto';

export function createPaginationResult<T>(
  items: T[],
  total: number,
  pagination: { limit?: number; offset?: number } = {},
): PaginatedDataDto<T> {
  const limit = pagination.limit ?? 10;
  const offset = pagination.offset ?? 0;
  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  return {
    items,
    meta: {
      totalItems: total,
      itemCount: items.length,
      itemsPerPage: limit,
      totalPages,
      currentPage,
    },
  };
}

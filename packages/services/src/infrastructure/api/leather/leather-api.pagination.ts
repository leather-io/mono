import { ZodSchema, z } from 'zod';

export const emptyPage: LeatherApiPage<unknown> = {
  meta: {
    page: 0,
    pageSize: 0,
    totalPages: 0,
    totalItems: 0,
  },
  data: [],
};

export interface LeatherApiPage<T> {
  meta: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
  data: T[];
}

export interface LeatherApiPageRequest {
  page: number;
  pageSize: number;
}

export function getPageRequestQueryParams(pageRequest: LeatherApiPageRequest): URLSearchParams {
  return new URLSearchParams({
    page: pageRequest.page.toString(),
    pageSize: pageRequest.pageSize.toString(),
  });
}

export function createPageSchema(schema: ZodSchema) {
  return z.object({
    meta: z.object({
      page: z.number(),
      pageSize: z.number(),
      totalPages: z.number(),
      totalItems: z.number(),
    }),
    data: z.array(schema),
  });
}

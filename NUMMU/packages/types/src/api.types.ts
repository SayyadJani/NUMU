/**
 * Generic API response envelope used across the NUMU API surface.
 */
export type ApiResponse<T> =
  | {
      data: T;
      success: true;
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
      };
    };

/**
 * Pagination metadata returned with list endpoints.
 */
export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

/**
 * A paginated API response.
 */
export type PaginatedResponse<T> = {
  data: T[];
  pagination: PaginationMeta;
  success: true;
};

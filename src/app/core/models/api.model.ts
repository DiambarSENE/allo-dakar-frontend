// Reflète web/dtos/common côté backend (ApiResponse<T>, PagedResponse<T>, PaginationMeta).
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginationMeta {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface PagedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: PaginationMeta;
}

// Reflète exceptions.ApiErrorResponse / GlobalExceptionHandler côté backend.
export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  code: string;
  message: string;
  path: string;
  details?: string[];
}

export interface PageQuery {
  page?: number;
  size?: number;
  sort?: string;
}

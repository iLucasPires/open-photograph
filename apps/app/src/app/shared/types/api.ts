export interface iApiError {
  detail: string
}

export interface iApiErrorResponse {
  data?: {
    errors?: iApiError[]
  }
}

export interface iApiPaginationNumber<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface iApiPaginationCursor<T> {
  cursor: string | null
  results: T[]
}

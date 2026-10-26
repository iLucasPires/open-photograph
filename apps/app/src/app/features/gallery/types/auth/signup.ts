export type ApiErrorItem = { message: string }

export type ApiError = { data?: { errors?: ApiErrorItem[] } }

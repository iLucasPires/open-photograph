import { apiFetch } from '@/app/core/clients/api'

export interface SessionResponse {
  data: { user?: { id: number; display: string; email: string } }
  meta: { is_authenticated: boolean }
}

interface AuthError {
  response?: { status: number }
  data?: SessionResponse
}

export async function getSession(): Promise<SessionResponse | null> {
  try {
    return await apiFetch<SessionResponse>('/api/browser/v1/auth/session')
  } catch (error) {
    if ((error as AuthError).response?.status === 401) return null
    throw error
  }
}

export async function endSession() {
  try {
    await apiFetch('/api/browser/v1/auth/session', { method: 'DELETE' })
  } catch (error) {
    const authError = error as AuthError
    // Allauth returns the unauthenticated state (401) after a successful logout.
    if (authError.response?.status === 401 && authError.data?.meta?.is_authenticated === false)
      return
    throw error
  }
}

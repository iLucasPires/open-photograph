import { ofetch } from 'ofetch'
import { useCookies } from '@vueuse/integrations/useCookies'

let onUnauthorized = () => window.location.assign('/account/login')

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler
}

let csrfPromise: Promise<void> | null = null

export async function ensureCsrf(): Promise<void> {
  const cookies = useCookies()

  if (cookies.get('csrftoken')) return

  if (!csrfPromise) {
    csrfPromise = ofetch('/api/browser/v1/config', { credentials: 'include' })
      .then(() => {})
      .finally(() => {
        csrfPromise = null
      })
  }

  return csrfPromise
}

export const apiFetch = ofetch.create({
  credentials: 'include',

  async onRequest({ options }) {
    await ensureCsrf()

    const cookies = useCookies()
    const csrf = cookies.get('csrftoken')

    const headers = new Headers(options.headers)

    if (csrf) {
      headers.set('X-CSRFToken', csrf)
    }

    options.headers = headers
  },

  onResponseError({ request, response }) {
    if (response.status === 401) {
      const isAuthRequest =
        typeof request === 'string' && request.startsWith('/api/browser/v1/auth/')
      if (!isAuthRequest) onUnauthorized()

      return
    }

    if (response.status >= 500) {
      const toast = useToast()

      toast.add({
        title: 'Erro interno do servidor',
        color: 'error',
      })
    }
  },
})

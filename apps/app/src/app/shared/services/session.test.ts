import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiFetch } from '@/app/core/clients/api'
import { endSession, getSession } from './session'

vi.mock('@/app/core/clients/api', () => ({ apiFetch: vi.fn<typeof apiFetch>() }))

describe('allauth session', () => {
  beforeEach(() => vi.resetAllMocks())

  it('loads the user from the session endpoint', async () => {
    const session = {
      data: { user: { id: 1, display: 'Admin', email: 'admin@example.com' } },
      meta: { is_authenticated: true },
    }
    vi.mocked(apiFetch).mockResolvedValue(session)
    expect(await getSession()).toEqual(session)
    expect(apiFetch).toHaveBeenCalledWith('/api/browser/v1/auth/session')
  })

  it('treats an unauthenticated session as logged out', async () => {
    vi.mocked(apiFetch).mockRejectedValue({ response: { status: 401 } })
    expect(await getSession()).toBeNull()
  })

  it('does not treat server failures as an absent session', async () => {
    const failure = { response: { status: 500 } }
    vi.mocked(apiFetch).mockRejectedValue(failure)
    await expect(getSession()).rejects.toEqual(failure)
  })

  it('accepts allauth 401 confirming successful logout', async () => {
    vi.mocked(apiFetch).mockRejectedValue({
      response: { status: 401 },
      data: { meta: { is_authenticated: false } },
    })
    await expect(endSession()).resolves.toBeUndefined()
    expect(apiFetch).toHaveBeenCalledWith('/api/browser/v1/auth/session', { method: 'DELETE' })
  })

  it('does not hide a failed logout', async () => {
    const failure = { response: { status: 403 } }
    vi.mocked(apiFetch).mockRejectedValue(failure)
    await expect(endSession()).rejects.toEqual(failure)
  })
})

import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { apiFetch } from '@/app/core/clients'
import GalleryTagsSelect from './admin-gallery-tags-select.vue'
import { galleryTagPayload } from './gallery-tag.payload'

vi.mock('@/app/core/clients', () => ({ apiFetch: vi.fn<typeof apiFetch>() }))
const request = vi.mocked(apiFetch)
const mounted: ReturnType<typeof mount>[] = []

afterEach(() => {
  mounted.splice(0).forEach((wrapper) => wrapper.unmount())
  vi.resetAllMocks()
})

describe('gallery tags', () => {
  it('loads every page so older tags remain selectable', async () => {
    request
      .mockResolvedValueOnce({
        results: [{ id: 'one', title: 'First', slug: 'first' }],
        next: '/api/tags/?page=2',
      })
      .mockResolvedValueOnce({
        results: [{ id: 'two', title: 'Second', slug: 'second' }],
        next: null,
      })
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    mounted.push(
      mount(GalleryTagsSelect, {
        props: { modelValue: [] },
        global: {
          plugins: [[VueQueryPlugin, { queryClient: client }]],
          stubs: { USelectMenu: true, UAlert: true },
        },
      }),
    )
    await flushPromises()
    await vi.waitFor(() => expect(client.getQueryData(['gallery-tags'])).toHaveLength(2))
    expect(request).toHaveBeenLastCalledWith('/api/tags/', { query: { page: 2, page_size: 1000 } })
  })

  it('rejects duplicate names regardless of case and whitespace', () => {
    expect(() =>
      galleryTagPayload(' portrait ', [{ id: 'one', title: 'Portrait', slug: 'portrait' }]),
    ).toThrow('Já existe uma tag com esse nome.')
  })

  it('keeps the slug stable when renaming a tag', () => {
    expect(galleryTagPayload(' New name ', [], 'one')).toEqual({ title: 'New name' })
  })

  it('generates a distinct slug when normalized names collide', () => {
    const body = galleryTagPayload('Portrait!', [
      { id: 'one', title: 'Portrait', slug: 'portrait' },
    ])
    expect(body.slug).toMatch(/^portrait-[a-f0-9]{8}$/)
  })
})

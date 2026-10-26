import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import TagFormModal from './admin-gallery-tag-form-modal.vue'

describe('tag form modal', () => {
  it('forwards overlay visibility and closing lifecycle to the modal', async () => {
    const queryClient = new QueryClient()
    const wrapper = mount(TagFormModal, {
      props: { open: true, tags: [] },
      global: {
        plugins: [[VueQueryPlugin, { queryClient }]],
        stubs: { Modal: { name: 'ModalStub', props: ['open'], template: '<div />' } },
      },
    })
    try {
      const modal = wrapper.findComponent({ name: 'ModalStub' })
      expect(modal.props('open')).toBe(true)
      await wrapper.setProps({ open: false })
      expect(modal.props('open')).toBe(false)
      modal.vm.$emit('update:open', false)
      modal.vm.$emit('after:leave')
      expect(wrapper.emitted('update:open')).toEqual([[false]])
      expect(wrapper.emitted('after:leave')).toHaveLength(1)
    } finally {
      wrapper.unmount()
      queryClient.clear()
    }
  })
})

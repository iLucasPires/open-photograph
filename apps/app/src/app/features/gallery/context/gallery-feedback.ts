import type { InjectionKey, Ref } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import type { SessionResponse } from '@/app/shared/services/session'
import type { GalleryFeedback } from '../types/feedback'

type MutationState<Payload> = {
  mutate: (payload: Payload) => void
  mutateAsync: (payload: Payload) => Promise<unknown>
  isPending: Ref<boolean>
  isSuccess: Ref<boolean>
}

export interface GalleryFeedbackContext {
  likingPhotos: Set<string>
  user: Ref<SessionResponse['data']['user']>
  isAuthenticated: Ref<boolean>
  loadingSession: Ref<boolean>
  loginRoute: Ref<RouteLocationRaw>
  requireLogin: () => Promise<boolean>
  data: Ref<GalleryFeedback | undefined>
  isPending: Ref<boolean>
  isError: Ref<boolean>
  refetch: () => Promise<unknown>
  selecting: Ref<boolean>
  selectedIds: Ref<string[]>
  name: Ref<string>
  like: MutationState<{ photoId: string; liked: boolean }>
  comment: MutationState<{ photoId: string; text: string }>
  submit: MutationState<{ email: string; message: string }>
  toggleSelection: (photoId: string) => void
}

export const galleryFeedbackKey: InjectionKey<GalleryFeedbackContext> = Symbol('gallery-feedback')

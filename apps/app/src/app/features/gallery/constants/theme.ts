import type { InjectionKey, Ref } from 'vue'

export const galleryThemeKey: InjectionKey<Ref<string>> = Symbol('gallery-theme')

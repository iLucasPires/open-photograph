export interface PreviewSettings {
  quality: number
  max_size: number
}

export interface PreviewResult {
  image: string
  width: number
  height: number
  bytes: number
  revision: number
}

export interface PreviewVariables {
  renderedRevision: number
  signal: AbortSignal
}

export interface RenderedPreview {
  blob: Blob
  width: number
  height: number
  revision: number
}

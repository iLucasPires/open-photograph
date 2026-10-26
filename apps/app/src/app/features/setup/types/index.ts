// ─── Setup base ──────────────────────────────────────────────────────────────

export type SetupType = 'payment' | 'storage'

export interface Setup {
  id: string
  name: string
  type: SetupType
  provider: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// ─── Pluggable Provider Manifests ───────────────────────────────────────────

export interface SetupStatus {
  needs_setup: boolean
  has_admin: boolean
  has_drive: boolean
  has_payment: boolean
}

export interface AdminAccountPayload {
  full_name: string
  email: string
  password: string
  confirm_password: string
}

// ─── Drive ───────────────────────────────────────────────────────────────────

export interface DriveStatus {
  connected: boolean
  email: string | null
  configured: boolean
  client_id: string | null
  callback_url: string
}

export interface DriveFolder {
  id: string
  name: string
  parent_id: string
  created_at: string
  updated_at: string
}

// ─── Payment ─────────────────────────────────────────────────────────────────

// ─── Stepper ─────────────────────────────────────────────────────────────────

export type SetupStep = 'account' | 'drive' | 'payment' | 'done'

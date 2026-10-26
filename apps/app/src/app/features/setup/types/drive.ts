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
  path: string
}

export interface DriveFolderTree {
  id: string
  name: string
  path: string
  children: DriveFolder[]
}

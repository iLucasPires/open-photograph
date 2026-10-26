export type VerifyError = {
  response?: { status: number }
  data?: { meta?: { is_authenticated?: boolean } }
}

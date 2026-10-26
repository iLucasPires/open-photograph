export interface RecentSale {
  id: string
  client_name: string
  client_email: string
  total: string
  paid_at: string
  payment_provider: string
}

export interface SalesSummary {
  currency: string
  currencies: string[]
  count: number
  revenue: string
  average: string
  series: { date: string; count: number; revenue: string }[]
  recent: RecentSale[]
}

export type SeriesPoint = SalesSummary['series'][number]

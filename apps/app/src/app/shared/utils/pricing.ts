const MIN_PRICE = 0.01
const MAX_PRICE = 99_999_999.99

function hasValidPricingInputs(price: number, itemCount: number, discountPercent: number) {
  return (
    Number.isFinite(price) &&
    price > 0 &&
    Number.isInteger(itemCount) &&
    itemCount > 0 &&
    discountPercent >= 0 &&
    discountPercent < 100
  )
}

function roundCurrency(value: number) {
  if (value < MIN_PRICE || value > MAX_PRICE) return undefined
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function calculateDiscountedTotal(
  unitPrice: number,
  itemCount: number,
  discountPercent: number,
) {
  if (!hasValidPricingInputs(unitPrice, itemCount, discountPercent)) return undefined
  return roundCurrency(unitPrice * itemCount * (1 - discountPercent / 100))
}

export function calculateUnitPriceFromTotal(
  totalPrice: number,
  itemCount: number,
  discountPercent: number,
) {
  if (!hasValidPricingInputs(totalPrice, itemCount, discountPercent)) return undefined
  return roundCurrency(totalPrice / (itemCount * (1 - discountPercent / 100)))
}

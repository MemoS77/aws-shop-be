import { getAll } from './db'
import { doResponse } from './inc'

export const handler = async () => {
  const products = await getAll('products')
  const stocks = await getAll('stocks')
  if (!products) return doResponse(200, [])
  const stockMap = stocks
    ? stocks.reduce((acc, stock) => {
        acc[stock.product_id] = stock.count
        return acc
      }, {} as Record<string, number>)
    : {}

  const productsWithCount = products.map((product) => ({
    ...product,
    count: stockMap[product.id] || 0,
  }))

  return doResponse(200, productsWithCount)
}

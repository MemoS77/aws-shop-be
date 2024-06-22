import { APIGatewayProxyEvent } from 'aws-lambda'
import { getAll } from './db'
import { doResponse, logError, logRequest } from './inc'

export const handler = async (event?: APIGatewayProxyEvent) => {
  logRequest(event)
  try {
    const products = await getAll('products')
    const stocks = await getAll('stocks')
    if (!products) return doResponse(200, [])

    const stockMap: Map<string, number> = new Map()
    stocks?.forEach((stock) => {
      stockMap.set(stock.product_id, stock.count)
    })

    const productsWithCount = products.map((product) => ({
      ...product,
      count: stockMap.get(product.id) || 0,
    }))

    return doResponse(200, productsWithCount)
  } catch (error) {
    logError(error)
    return doResponse(500, { message: 'Get products list failed' })
  }
}

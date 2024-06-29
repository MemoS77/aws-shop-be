import type { APIGatewayProxyEvent } from 'aws-lambda'
import {
  TABLE_PRODUCTS,
  TABLE_STOCKS,
  doResponse,
  logError,
  logRequest,
} from './inc'
import { getOne } from './db'

export const handler = async (event: APIGatewayProxyEvent) => {
  logRequest(event)

  try {
    const id = event.pathParameters?.id
    if (id && id.length) {
      const item = await getOne(TABLE_PRODUCTS, id)
      if (item) {
        const count = await getOne(TABLE_STOCKS, id, 'product_id')
        return doResponse(200, {
          ...item,
          count: count?.count || 0,
        })
      }
      return doResponse(404, { message: `Product ${id} not found` })
    } else return doResponse(400, { message: `Invalid product id` })
  } catch (error) {
    logError(error)
    return doResponse(500, {
      message: `Get product failed! ${TABLE_PRODUCTS}, ${TABLE_STOCKS} `,
    })
  }
}

import type { APIGatewayProxyEvent } from 'aws-lambda'

import { doResponse } from './inc'
import { getOne } from './db'

export const handler = async (event: APIGatewayProxyEvent) => {
  try {
    const id = event.pathParameters?.id
    if (id) {
      const item = getOne('products', id)
      if (item) return doResponse(200, item)
    }

    return doResponse(404, { message: 'Product not found' })
  } catch (err) {
    return doResponse(500, { message: 'DB error' })
  }
}

import type { APIGatewayProxyEvent } from 'aws-lambda'

import { doResponse } from './inc'
import { getOne } from './db'

export const handler = async (event: APIGatewayProxyEvent) => {
  const id = event.pathParameters?.id
  if (id) {
    const item = await getOne('products', id)
    if (item) return doResponse(200, item)
  }
  return doResponse(404, { message: `Product ${id} not found` })
}

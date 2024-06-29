import type { APIGatewayProxyEvent } from 'aws-lambda'
import { transaction } from './db'
import {
  TABLE_PRODUCTS,
  TABLE_STOCKS,
  doResponse,
  logError,
  logRequest,
} from './inc'
import { randomUUID } from 'crypto'

export const handler = async (event: APIGatewayProxyEvent) => {
  logRequest(event)

  let body
  try {
    body = JSON.parse(event.body!)
  } catch (error) {
    logError(error, 'Create product pasrse body error')
    return doResponse(400, { message: 'Invalid request body' })
  }

  try {
    const { title, description, price, count } = body

    // Пример валидации данных
    if (
      !title ||
      !description ||
      !price ||
      typeof price !== 'number' ||
      !count ||
      typeof count !== 'number'
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message:
            'Invalid product data. Provide id, title, description, price, count',
        }),
      }
    }
    /*
    const item = await createProduct(TABLE_PRODUCTS, {
      id,
      title,
      description,
      price,
    })*/

    const id = randomUUID()

    const productItem = {
      id,
      title,
      description,
      price,
    }

    const stockItem = {
      product_id: id,
      count,
    }

    await transaction([
      { Put: { TableName: TABLE_PRODUCTS, Item: productItem } },
      { Put: { TableName: TABLE_STOCKS, Item: stockItem } },
    ])

    return doResponse(200, { message: 'Product created' })
  } catch (error) {
    console.error('Error creating product:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to create product' }),
    }
  }
}

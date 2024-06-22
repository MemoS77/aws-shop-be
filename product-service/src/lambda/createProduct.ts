import type { APIGatewayProxyEvent } from 'aws-lambda'
import { createProduct } from './db'
import { TABLE_PRODUCTS, doResponse, logError, logRequest } from './inc'

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
    const { id, title, description, price } = body

    // Пример валидации данных
    if (!id || !title || !description || !price || typeof price !== 'number') {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Invalid product data' }),
      }
    }

    const item = await createProduct(TABLE_PRODUCTS, {
      id,
      title,
      description,
      price,
    })

    return doResponse(200, item)
  } catch (error) {
    console.error('Error creating product:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to create product' }),
    }
  }
}

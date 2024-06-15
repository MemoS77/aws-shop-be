import type { APIGatewayProxyEvent } from 'aws-lambda'
import mockedList from './mockedList'
import { doResponse } from './inc'

// event
export const handler = async (event: APIGatewayProxyEvent) => {
  const id = event.pathParameters?.id
  if (id) {
    const item = mockedList.find((item) => item.id === id)
    if (item) {
      return doResponse(200, item)
    }
  }

  return doResponse(404, { message: 'Product not found' })
}
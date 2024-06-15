import type { APIGatewayProxyEvent } from 'aws-lambda'
import mockedList from './mockedList'

// event
export const handler = async (event: APIGatewayProxyEvent) => {
  const id = event.pathParameters?.id
  if (id) {
    const item = mockedList.find((item) => item.id === id)
    if (item) {
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      }
    }
  }

  return {
    statusCode: 404,
    headers: { 'Content-Type': 'text/plain' },
    body: 'Product not found',
  }
}

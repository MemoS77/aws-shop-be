import { APIGatewayProxyEvent } from 'aws-lambda'

export const defHeader = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': '*',
  'Access-Control-Allow-Credentials': true,
  'Content-Type': 'application/json',
}

export const doResponse = (statusCode: number, body: object) => ({
  statusCode,
  headers: defHeader,
  body: JSON.stringify(body),
})

export const logRequest = (event?: APIGatewayProxyEvent) => {
  if (event)
    console.log(
      'API_REQUEST',
      event.path,
      event.queryStringParameters,
      event.body,
    )
}

export const logError = (err: unknown, message?: string) => {
  console.error('API_ERROR' + (message ? `: ${message}` : ''), err)
}

export const log = (...fields: any) => {
  console.log('PRODUCT_LOG', ...fields)
}

export const TABLE_PRODUCTS = process.env.TABLE_PRODUCTS!
export const TABLE_STOCKS = process.env.TABLE_STOCKS!
export const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN!

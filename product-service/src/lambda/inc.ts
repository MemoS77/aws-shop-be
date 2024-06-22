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

export const logError = (err: unknown) => {
  console.error('API_ERROR', err)
}

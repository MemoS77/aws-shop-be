import { APIGatewayProxyEvent } from 'aws-lambda'

export const defHeader = {
  'Access-Control-Allow-Origin': 'https://d1sqwar1feok6t.cloudfront.net',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, OPTIONS',
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
      'IMPORT_API_REQUEST',
      event.path,
      event.queryStringParameters,
      event.body,
    )
}

export const logError = (err: unknown, message?: string) => {
  console.error('IMPORT_API_ERROR' + (message ? `: ${message}` : ''), err)
}

export const log = (...fields: any) => {
  console.log('IMPORT_LOG', ...fields)
}

import { json } from 'stream/consumers'

export const defHeader = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
  'Content-Type': 'application/json',
}

export const doResponse = (statusCode: number, body: object) => ({
  statusCode,
  headers: defHeader,
  body: JSON.stringify(body),
})
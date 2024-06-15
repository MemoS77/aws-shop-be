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

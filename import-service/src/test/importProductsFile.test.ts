import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from 'aws-lambda'
import { handler } from '../lambda/importProductsFile'

jest.mock('@aws-sdk/client-s3')
jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('blabla'),
}))

describe('handler', () => {
  it('should generate signed URL and return it', async () => {
    const mockEvent = {
      queryStringParameters: {
        name: 'test.csv',
      },
    } as unknown as APIGatewayProxyEvent

    const mockContext = {} as Context
    const mockCallback = jest.fn()

    const response = (await handler(
      mockEvent,
      mockContext,
      mockCallback,
    )) as APIGatewayProxyResult

    expect(response.statusCode).toBe(200)
    expect(JSON.parse(response.body).signedUrl).toBe('blabla')
  })

  it('should return 400 if name is not provided', async () => {
    const mockEvent = {
      queryStringParameters: {},
    } as unknown as APIGatewayProxyEvent

    const mockContext = {} as Context
    const mockCallback = jest.fn()

    const response = (await handler(
      mockEvent,
      mockContext,
      mockCallback,
    )) as APIGatewayProxyResult

    expect(response.statusCode).toBe(400)
    expect(JSON.parse(response.body).message).toBe('Name required')
  })
})

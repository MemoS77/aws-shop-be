import { handler } from '../lambda/importFileParser' // Replace with your actual lambda function module
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import * as stream from 'stream'

jest.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: jest.fn(() => ({
      send: jest.fn(),
    })),
    GetObjectCommand: jest.fn(),
    CopyObjectCommand: jest.fn(),
  }
})

describe('Lambda Function Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks() // Clear all mock calls between tests
  })

  describe('handler function', () => {
    it('should handle S3 event and process file', async () => {
      const mockEvent = {
        Records: [
          {
            s3: {
              bucket: { name: 'testBucket' },
              object: { key: 'uploaded/test.csv' },
            },
          },
        ],
      }

      // @ts-ignore
      await handler(mockEvent)

      expect(GetObjectCommand).toHaveBeenCalledWith({
        Bucket: 'testBucket',
        Key: 'uploaded/test.csv',
      })
      const mockResponse = {
        Body: new stream.Readable(),
      }
      const mockSendFn = jest.fn().mockResolvedValue(mockResponse)
      ;(S3Client as jest.Mock).mockImplementation(() => ({
        send: mockSendFn,
      }))
      mockResponse.Body.emit('end')
    })
  })
})

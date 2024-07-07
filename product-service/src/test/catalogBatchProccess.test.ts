import { handler } from '../lambda/catalogBatchProcess' // Подставьте правильный путь к файлу с функцией
import { SNSClient } from '@aws-sdk/client-sns'
import { transaction } from '../lambda/db'
import { log } from '../lambda/inc'

jest.mock('@aws-sdk/client-sns', () => {
  return {
    SNSClient: jest.fn().mockReturnValue({
      send: jest.fn(),
    }),
    PublishCommand: jest.fn(),
  }
})

jest.mock('../lambda/db', () => ({
  transaction: jest.fn(),
}))

jest.mock('../lambda/inc', () => ({
  log: jest.fn(),
}))

describe('handler', () => {
  let snsClientMock: any

  beforeEach(() => {
    snsClientMock = new SNSClient()
    jest.clearAllMocks()
  })

  it('should process valid records and send SNS messages', async () => {
    const event = {
      Records: [
        {
          body: JSON.stringify({
            id: '1',
            title: 'Product 1',
            description: 'Description 1',
            price: 5,
            count: 10,
          }),
        },
        {
          body: JSON.stringify({
            id: '2',
            title: 'Product 2',
            description: 'Description 2',
            price: 15,
            count: 5,
          }),
        },
      ],
    }

    await handler(event)

    expect(transaction).toHaveBeenCalledTimes(1)
    expect(snsClientMock.send).toHaveBeenCalledTimes(2)
  })

  it('should log if no valid records are provided', async () => {
    const event = {
      Records: [
        {
          body: JSON.stringify({
            id: '',
            title: '',
            description: '',
            price: 'invalid',
            count: 'invalid',
          }),
        },
      ],
    }

    await handler(event)

    expect(transaction).not.toHaveBeenCalled()
    expect(log).toHaveBeenCalledWith('No products to add!')
  })
})

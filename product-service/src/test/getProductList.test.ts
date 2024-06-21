import { handler } from '../lambda/getProductsList'
import mockedList from '../model/db/mockedList'

describe('productList', () => {
  it('must be 200 and full exist', async () => {
    const result = await handler()
    const products = JSON.parse(result.body)
    expect(result.statusCode).toBe(200)
    expect(products).toStrictEqual(mockedList)
  })
})

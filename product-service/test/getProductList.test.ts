import { handler } from '../src/lambda/getProductsList'
import mockedList from '../src/lambda/mockedList'

describe('productList', () => {
  it('must be 200 and full exist', async () => {
    const result = await handler()
    const products = JSON.parse(result.body)
    //console.log('list', products)
    expect(result.statusCode).toBe(200)
    expect(products).toStrictEqual(mockedList)
  })
})

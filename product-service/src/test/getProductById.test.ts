import { handler } from '../lambda/getProductsById'
import mockedList from '../model/db/mockedList'

describe('productById', () => {
  it('should be exist and eual and 200 response', async () => {
    const item = mockedList[0]

    const result = await handler({
      pathParameters: { id: item.id },
    } as any)
    const respItem = JSON.parse(result.body)
    expect(result.statusCode).toBe(200)
    expect(respItem).toStrictEqual(item)
  })

  // 404
  it('should be not exist and 404 response', async () => {
    const result = await handler({
      pathParameters: { id: 'dfgdfg' },
    } as any)
    const respItem = JSON.parse(result.body)
    expect(result.statusCode).toBe(404)
    expect(respItem).toStrictEqual({ message: 'Product not found' })
  })
})

import mockedList from './mockedList'
import { ProductItem, StockItem } from './types'

const productsItems: ProductItem[] = []

const stocksItems: StockItem[] = []

mockedList.forEach((item) => {
  productsItems.push({
    id: item.id,
    title: item.title,
    description: item.description,
    price: item.price,
  })
  stocksItems.push({ product_id: item.id, count: item.count })
})

export const prepareData = () => {
  return { productsItems, stocksItems }
}

export type TableRowValue = string | number | boolean

export type TableValue =
  | TableRowValue
  | TableRowValue[]
  | Record<string, TableRowValue>

export type TableItem = Record<string, TableValue>
export interface DynamoDBTable {
  tableName: string
  data: TableItem[]
}

export type ProductMockedItem = {
  id: string
  title: string
  description: string
  price: number
  count: number
  image: string
}

export type ProductItem = {
  id: string
  title: string
  description: string
  price: number
}

export type StockItem = {
  product_id: string
  count: number
}

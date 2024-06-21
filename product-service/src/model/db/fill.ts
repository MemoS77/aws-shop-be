import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { DynamoDBTable, TableItem } from './types'
import { prepareData } from './prepareData'

const client = new DynamoDBClient() // { region: 'your-region' }) Замените 'your-region' на ваш регион
const ddbDocClient = DynamoDBDocumentClient.from(client)

const allData = prepareData()

const tables: DynamoDBTable[] = [
  {
    tableName: 'products',
    data: allData.productsItems,
  },
  {
    tableName: 'stocks',
    data: allData.stocksItems,
  },
]

const addItem = async (table: string, item: TableItem) => {
  try {
    const params = {
      TableName: table,
      Item: item,
    }
    await ddbDocClient.send(new PutCommand(params))
    console.log('Item successfully added:', item)
  } catch (err) {
    console.error('Error adding item:', err)
  }
}

export const fillDB = async () => {
  for (const table of tables) {
    for (const item of table.data) {
      await addItem(table.tableName, item)
    }
  }
}

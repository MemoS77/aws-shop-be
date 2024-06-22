import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  GetCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient()
const dbClient = DynamoDBDocumentClient.from(client)

export async function getAll<T = any>(
  tableName: string,
): Promise<Record<string, T>[] | undefined> {
  const scanCommand = new ScanCommand({ TableName: tableName })
  const scanResult = await dbClient.send(scanCommand)
  return scanResult.Items as Record<string, T>[]
}

export async function getOne<T = any>(
  tableName: string,
  id: string,
  keyField: string = 'id',
): Promise<T | undefined> {
  const command = new GetCommand({
    TableName: tableName,
    Key: { [keyField]: id },
  })
  const res = await dbClient.send(command)
  return res.Item as T
}

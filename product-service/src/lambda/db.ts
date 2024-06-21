import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  GetCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb'

const client = new DynamoDBClient()
const ddbDocClient = DynamoDBDocumentClient.from(client)

export async function getAll<T = any>(
  tableName: string,
): Promise<Record<string, T>[] | undefined> {
  const scanCommand = new ScanCommand({ TableName: tableName })
  const scanResult = await ddbDocClient.send(scanCommand)
  return scanResult.Items
}

export async function getOne<T = any>(
  tableName: string,
  id: string,
): Promise<T | undefined> {
  const command = new GetCommand({
    TableName: tableName,
    Key: { id },
  })
  const res = await ddbDocClient.send(command)
  return res.Item as T
}

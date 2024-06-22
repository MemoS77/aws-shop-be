import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  GetCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb'
import { doResponse } from './inc'

const client = new DynamoDBClient()
const ddbDocClient = DynamoDBDocumentClient.from(client)

export async function getAll<T = any>(
  tableName: string,
): Promise<Record<string, T>[] | undefined> {
  try {
    const scanCommand = new ScanCommand({ TableName: tableName })
    const scanResult = await ddbDocClient.send(scanCommand)
    return scanResult.Items as Record<string, T>[]
  } catch (err) {
    doResponse(500, { message: 'DB error in getAll' })
  }
  return undefined
}

export async function getOne<T = any>(
  tableName: string,
  id: string,
): Promise<T | undefined> {
  try {
    const command = new GetCommand({
      TableName: tableName,
      Key: { id },
    })
    const res = await ddbDocClient.send(command)
    return res.Item as T
  } catch (err) {
    doResponse(500, { message: 'DB error in getOne' })
  }
  return undefined
}

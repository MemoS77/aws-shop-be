import { S3Event, S3Handler } from 'aws-lambda'
import {
  S3Client,
  GetObjectCommand,
  CopyObjectCommand,
} from '@aws-sdk/client-s3'
import * as stream from 'stream'
import { log, logError } from './inc'
import CsvParser from './csvparser'
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs'

const s3Client = new S3Client({})

const sqsClient = new SQSClient({})

const SQS_URL = process.env.SQS_URL

const sendSqs = async (data: any) => {
  const sqsParams = {
    QueueUrl: SQS_URL,
    MessageBody: JSON.stringify(data),
  }

  try {
    await sqsClient.send(new SendMessageCommand(sqsParams))
    log('Sent record to SQS', data)
  } catch (error) {
    logError(error, `Error sending record to SQS: ${SQS_URL}`)
  }
}

const copyFile = async (
  bucket: string,
  sourceKey: string,
  destinationKey: string,
) => {
  try {
    log(`Copying file from ${sourceKey} to ${destinationKey}`)
    await s3Client.send(
      new CopyObjectCommand({
        Bucket: bucket,
        CopySource: `/${bucket}/${sourceKey}`,
        Key: destinationKey,
      }),
    )
    // Deletion in separate lambda
  } catch (error) {
    logError(error, `Error copying file from ${sourceKey} to ${destinationKey}`)
  }
}

export const handler: S3Handler = async (event: S3Event) => {
  const record = event.Records[0]
  const bucket = record.s3.bucket.name
  const key = record.s3.object.key

  const params = {
    Bucket: bucket,
    Key: key,
  }

  try {
    const command = new GetObjectCommand(params)
    const response = await s3Client.send(command)

    const results: any[] = []

    if (response.Body instanceof stream.Readable) {
      // Promisified pipe function
      const parseCsv = (body: stream.Readable) => {
        return new Promise<void>((resolve, reject) => {
          body
            .pipe(new CsvParser())
            .on('data', (data) => {
              results.push(data)
            })
            .on('end', () => {
              log('CSV Data parsed', results)
              resolve()
            })
            .on('error', (error) => {
              logError(error, 'Error parsing CSV')
              reject(error)
            })
        })
      }
      await parseCsv(response.Body)
      await Promise.all(results.map((data) => sendSqs(data)))
      log('All data sent to SQS')
      const parsedKey = key.replace('uploaded/', 'parsed/')
      await copyFile(bucket, key, parsedKey)
    } else {
      throw new Error('Response body is not a readable stream.')
    }
  } catch (error) {
    logError(error, 'Error processing S3 event')
  }
}

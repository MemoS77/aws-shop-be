import { S3Event, S3Handler } from 'aws-lambda'
import {
  S3Client,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'
import * as stream from 'stream'
import { log, logError } from './inc'
import CsvParser from './csvparser'

const s3Client = new S3Client({})

const moveFile = async (
  bucket: string,
  sourceKey: string,
  destinationKey: string,
) => {
  try {
    log('Move file', sourceKey, destinationKey)
    const copyResult = await s3Client.send(
      new CopyObjectCommand({
        Bucket: bucket,
        CopySource: `/${bucket}/${sourceKey}`,
        Key: destinationKey,
      }),
    )

    log('Copy result', copyResult)

    const delRes = await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: sourceKey,
      }),
    )

    log('Delete result', delRes)
  } catch (error) {
    logError(error, 'Error moving file')
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
      response.Body.pipe(new CsvParser())
        .on('data', (data) => results.push(data))
        .on('end', () => {
          log('CSV Data', results)
        })
        .on('error', (error) => {
          logError(error, 'Error parsing CSV')
        })
        .on('close', () => {
          log('CSV file closed!', key)
          const parsedKey = key.replace('uploaded/', 'parsed/')
          moveFile(bucket, key, parsedKey)
        })
    } else {
      throw new Error('Response body is not a readable stream.')
    }
  } catch (error) {
    logError(error, 'Error processing S3 event')
  }
}

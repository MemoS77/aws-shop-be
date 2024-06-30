import { S3Event, S3Handler } from 'aws-lambda'
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { log, logError } from './inc'

const s3Client = new S3Client({})

export const handler: S3Handler = async (event: S3Event) => {
  const record = event.Records[0]
  const bucket = record.s3.bucket.name
  const key = record.s3.object.key

  try {
    const delKey = key.replace('parsed/', 'uploaded/')
    log(`Try to delete ${delKey}`)

    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: delKey,
      }),
    )
  } catch (error) {
    logError(error, 'Cannot delete file')
  }
}

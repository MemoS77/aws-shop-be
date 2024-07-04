import { PublishCommand, SNSClient } from '@aws-sdk/client-sns'
import { log, logError, SNS_TOPIC_ARN } from './inc'

export const handler = async (event: { Records: any[] }) => {
  const putRequests = event.Records.map((record) => {
    const body = JSON.parse(record.body)
    return {
      PutRequest: {
        Item: {
          id: body.id,
          title: body.title,
          description: body.description,
          price: body.price,
        },
      },
    }
  })

  const snsClient = new SNSClient()

  try {
    const list = `Products: ${putRequests
      .map((pr) => pr.PutRequest.Item.title)
      .join(', ')}`
    const snsMessage = {
      Message: list,
      TopicArn: SNS_TOPIC_ARN,
    }
    log('Need create: ', list)
    await snsClient.send(new PublishCommand(snsMessage))
  } catch (error) {
    logError(error)
  }
}

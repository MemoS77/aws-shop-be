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
    const snsMessage = {
      Message: `Products titles: ${putRequests
        .map((pr) => pr.PutRequest.Item.title)
        .join(', ')}`,
      TopicArn: SNS_TOPIC_ARN,
    }

    await snsClient.send(new PublishCommand(snsMessage))
    log('Success send sns!')
  } catch (error) {
    logError(error)
  }

  console.log('TTT', putRequests)
}

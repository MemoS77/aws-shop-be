import { PublishCommand, SNSClient } from '@aws-sdk/client-sns'
import {
  log,
  logError,
  SNS_TOPIC_ARN,
  TABLE_PRODUCTS,
  TABLE_STOCKS,
} from './inc'
import { transaction } from './db'

export const handler = async (event: { Records: any[] }) => {
  try {
    let message = 'Products added: '
    let transList: any[] = []

    event.Records.forEach((record) => {
      const body = JSON.parse(record.body)

      const productItem = {
        id: body.id,
        title: body.title,
        description: body.description,
        price: body.price,
      }

      const stockItem = {
        product_id: body.id,
        count: body.count,
      }

      transList.push({ Put: { TableName: TABLE_PRODUCTS, Item: productItem } })
      transList.push({ Put: { TableName: TABLE_STOCKS, Item: stockItem } })

      message += `\n${JSON.stringify(body)}`
    })

    try {
      await transaction(transList)
    } catch (error) {
      logError(error, 'DB Transactiion error!')
    }

    const snsClient = new SNSClient()
    try {
      const snsMessage = {
        Message: message,
        TopicArn: SNS_TOPIC_ARN,
      }
      log(message)
      await snsClient.send(new PublishCommand(snsMessage))
    } catch (error) {
      logError(error, 'SNS Error!')
    }
  } catch (error) {
    logError(error, 'Batch process error!')
  }
}

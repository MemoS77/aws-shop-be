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
    let message = 'Products to add: '
    let transList: any[] = []

    //event.Records.forEach((record) =>
    for (const record of event.Records) {
      try {
        const body = JSON.parse(record.body)

        const productItem = {
          id: body.id,
          title: body.title,
          description: body.description,
          price: +body.price,
        }

        const stockItem = {
          product_id: body.id,
          count: +body.count,
        }

        // Валидность данных
        if (
          !productItem.id ||
          !productItem.title ||
          !productItem.description ||
          typeof productItem.price !== 'number' ||
          typeof stockItem.count !== 'number'
        )
          continue

        transList.push({
          Put: { TableName: TABLE_PRODUCTS, Item: productItem },
        })
        transList.push({ Put: { TableName: TABLE_STOCKS, Item: stockItem } })

        message += `\n${JSON.stringify(body)}`
      } catch (error) {
        logError(error, 'Bad item')
      }
    }

    if (!transList.length) {
      log('No products to add!')
      return
    }

    log(message)

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

      await snsClient.send(new PublishCommand(snsMessage))
    } catch (error) {
      logError(error, 'SNS Error!')
    }
  } catch (error) {
    logError(error, 'Batch process error!')
  }
}

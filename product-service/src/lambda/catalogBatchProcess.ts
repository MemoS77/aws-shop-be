import { PublishCommand, SNSClient } from '@aws-sdk/client-sns'
import {
  log,
  logError,
  SNS_TOPIC_ARN,
  TABLE_PRODUCTS,
  TABLE_STOCKS,
} from './inc'
import { transaction } from './db'
import { randomUUID } from 'crypto'

export const handler = async (event: { Records: any[] }) => {
  try {
    let lcMessage = ''
    let hcMessage = ''
    let transList: any[] = []
    const HIGH_PRICE = 10

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

        if (!productItem.id) productItem.id = randomUUID()

        const stockItem = {
          product_id: productItem.id,
          count: +body.count,
        }

        // Валидность данных
        if (
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

        const t = JSON.stringify(productItem)

        productItem.price >= HIGH_PRICE
          ? (hcMessage += `\n${t}`)
          : (lcMessage += `\n${t}`)
      } catch (error) {
        logError(error, 'Bad item')
      }
    }

    if (!transList.length) {
      log('No products to add!')
      return
    }

    try {
      await transaction(transList)
    } catch (error) {
      logError(error, 'DB Transactiion error!')
    }

    log('Products added', transList.length)

    try {
      const snsClient = new SNSClient()
      if (lcMessage.length) {
        log('Low cost products', lcMessage)
        const snsMessage = {
          Message: 'Low cost produts:' + lcMessage,
          TopicArn: SNS_TOPIC_ARN,
          MessageAttributes: {
            isHighCost: {
              DataType: 'String',
              StringValue: 'false',
            },
          },
        }
        await snsClient.send(new PublishCommand(snsMessage))
      }

      if (hcMessage.length) {
        log('High cost products', hcMessage)
        const snsMessage = {
          Message: 'High cost produts:' + hcMessage,
          TopicArn: SNS_TOPIC_ARN,
          MessageAttributes: {
            isHighCost: {
              DataType: 'String',
              StringValue: 'true',
            },
          },
        }
        await snsClient.send(new PublishCommand(snsMessage))
      }
    } catch (error) {
      logError(error, 'SNS Error!')
    }
  } catch (error) {
    logError(error, 'Batch process error!')
  }
}

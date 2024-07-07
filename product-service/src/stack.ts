import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as sqs from 'aws-cdk-lib/aws-sqs'
import * as sns from 'aws-cdk-lib/aws-sns'
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources'
import * as snsSubscriptions from 'aws-cdk-lib/aws-sns-subscriptions'
import { AppConf } from './types'

export class ProductServiceStack extends cdk.Stack {
  constructor(
    conf: AppConf,
    scope: Construct,
    id: string,
    props?: cdk.StackProps,
  ) {
    super(scope, id, props)

    const productsTable = dynamodb.Table.fromTableName(
      this,
      'ExistingProductsTable',
      'products',
    )
    const stocksTable = dynamodb.Table.fromTableName(
      this,
      'ExistingStocksTable',
      'stocks',
    )

    const environment = {
      TABLE_PRODUCTS: productsTable.tableName,
      TABLE_STOCKS: stocksTable.tableName,
    }

    // Lambda function to get the list of products
    const getProductsList = new lambda.Function(
      this,
      'getProductsListFunction',
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        code: lambda.Code.fromAsset('./dist/lambda'),
        handler: 'getProductsList.handler',
        environment,
      },
    )

    // Lambda function to get a product by ID
    const getProductsById = new lambda.Function(
      this,
      'getProductsByIdFunction',
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        code: lambda.Code.fromAsset('./dist/lambda'),
        handler: 'getProductsById.handler',
        environment,
      },
    )

    const createProductFunction = new lambda.Function(
      this,
      'createProductFunction',
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        code: lambda.Code.fromAsset('./dist/lambda'),
        handler: 'createProduct.handler',
        environment,
      },
    )

    productsTable.grantWriteData(createProductFunction)
    stocksTable.grantWriteData(createProductFunction)

    productsTable.grantReadData(getProductsList)
    stocksTable.grantReadData(getProductsList)

    productsTable.grantReadData(getProductsById)
    stocksTable.grantReadData(getProductsById)

    // Create API Gateway
    const api = new apigateway.LambdaRestApi(this, 'productsApi', {
      handler: getProductsList, // Default handler
      proxy: false,
    })

    // Create 'products' resource
    const productsResource = api.root.addResource('products')
    productsResource.addMethod('GET') // GET /products

    const gate = new apigateway.LambdaIntegration(createProductFunction)
    productsResource.addMethod('POST', gate)

    const productByIdResource = productsResource.addResource('{id}')
    productByIdResource.addMethod(
      'GET',
      new apigateway.LambdaIntegration(getProductsById),
    )

    // SNS Topic
    const createProductTopic = new sns.Topic(this, 'createProductTopic', {
      displayName: 'Create Product Topic',
    })

    // Email subscription for low-cost products
    if (!conf.noEmails && conf.lowCostEmail) {
      createProductTopic.addSubscription(
        new snsSubscriptions.EmailSubscription(conf.lowCostEmail, {
          filterPolicy: {
            isHighCost: sns.SubscriptionFilter.stringFilter({
              allowlist: ['false'],
            }),
          },
        }),
      )
    }

    // Default email subscription
    if (!conf.noEmails && conf.email) {
      createProductTopic.addSubscription(
        new snsSubscriptions.EmailSubscription(conf.email, {
          filterPolicy: {
            isHighCost: sns.SubscriptionFilter.stringFilter({
              allowlist: ['true'],
            }),
          },
        }),
      )
    }

    const catalogBatchProcess = new lambda.Function(
      this,
      'catalogBatchProcess',
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        code: lambda.Code.fromAsset('./dist/lambda'),
        handler: 'catalogBatchProcess.handler',
        environment: {
          ...environment,
          SNS_TOPIC_ARN: createProductTopic.topicArn,
        },
      },
    )

    productsTable.grantReadWriteData(catalogBatchProcess)
    stocksTable.grantReadWriteData(catalogBatchProcess)
    createProductTopic.grantPublish(catalogBatchProcess)

    const catalogItemsQueue = new sqs.Queue(this, 'catalogItemsQueue', {
      visibilityTimeout: cdk.Duration.seconds(100),
      retentionPeriod: cdk.Duration.seconds(100),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    const eventSource = new lambdaEventSources.SqsEventSource(
      catalogItemsQueue,
      {
        batchSize: 5,
        maxBatchingWindow: cdk.Duration.seconds(10),
      },
    )

    catalogBatchProcess.addEventSource(eventSource)

    new cdk.CfnOutput(this, 'SQS URL', {
      value: catalogItemsQueue.queueUrl,
      exportName: 'CatalogItemsQueueUrl',
    })

    new cdk.CfnOutput(this, 'CatalogItemsQueueArn', {
      value: catalogItemsQueue.queueArn,
      exportName: 'CatalogItemsQueueArn',
    })
  }
}

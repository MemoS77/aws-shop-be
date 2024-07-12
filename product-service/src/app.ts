#!/usr/bin/env node
// env: { account: '123456789012', region: 'eu-west-1' },
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { ProductServiceStack } from './stack'
import { config } from 'dotenv'
import { AppConf } from './types'
config()
const app = new cdk.App()

const appConf: AppConf = {
  email: process.env.NOTIFY_EMAIL as string,
  lowCostEmail: process.env.LOW_COST_NOTIFY_EMAIL as string,
  noEmails: process.env.NOT_SEND_EMAILS === 'true',
}

//console.log('AppConf', appConf)
new ProductServiceStack(appConf, app, 'ProductServiceStack', {})

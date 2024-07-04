#!/usr/bin/env node
// env: { account: '123456789012', region: 'eu-west-1' },
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { ProductServiceStack } from './stack'
import { config } from 'dotenv'
config()
const app = new cdk.App()
const email = process.env.NOTIFY_EMAIL as string
if (!email) throw new Error('EMAIL is not defined')
new ProductServiceStack(email, app, 'ProductServiceStack', {})

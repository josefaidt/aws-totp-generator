import * as cdk from 'aws-cdk-lib'
import { TotpGeneratorStack } from '../lib/stack.js'

const app = new cdk.App({
  context: {
    secret: 'provider/discord/totp-key',
  },
})

const totpSecretName = app.node.tryGetContext('secret')

new TotpGeneratorStack(app, 'TotpGeneratorStack', {
  totpSecretName,
})

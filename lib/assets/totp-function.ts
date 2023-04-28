/// <reference path="./lambda-env.d.ts" />
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager'
import generateTotp from 'totp-generator'

/**
 * Fetch secret key provided by Discord from AWS Secrets Manager
 */
async function fetchTotpKey() {
  const client = new SecretsManagerClient({ region: process.env.AWS_REGION })
  const command = new GetSecretValueCommand({
    SecretId: process.env.SECRET_NAME,
  })
  const secret = await client.send(command)
  if (!secret.SecretString) {
    throw new Error('SecretString is empty')
  }
  return secret.SecretString
}

export async function handler() {
  const secret = await fetchTotpKey()
  const totp = generateTotp(secret)
  return totp
}

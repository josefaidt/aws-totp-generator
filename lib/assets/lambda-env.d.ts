declare global {
  namespace NodeJS {
    interface ProcessEnv {
      /**
       * AWS Region
       */
      readonly AWS_REGION: string
      /**
       * The name of the secret in Secrets Manager that contains the Discord MFA key
       * @example "prod/amplify-discord/owner-mfa-key"
       */
      readonly SECRET_NAME: string
    }
  }
}

export {}

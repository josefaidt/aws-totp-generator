import * as url from 'node:url'
import * as cdk from 'aws-cdk-lib'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs'
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager'
import { Construct } from 'constructs'

export type TotpGeneratorStackProps = cdk.StackProps & {
  /**
   * Name of the secret containing the Discord TOTP key
   */
  totpSecretName: string
}

export class TotpGeneratorStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: TotpGeneratorStackProps) {
    super(scope, id, props)

    const { totpSecretName } = props

    const vpc = new ec2.Vpc(this, 'Vpc', {
      maxAzs: 2,
      vpcName: 'totp-generator-vpc',
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
      ],
    })

    const securityGroup = new ec2.SecurityGroup(this, 'SecurityGroup', {
      vpc,
      securityGroupName: 'totp-generator-sg',
    })

    const totpFunction = new lambda.NodejsFunction(this, 'TotpFunction', {
      runtime: Runtime.NODEJS_18_X,
      entry: url.fileURLToPath(
        new URL('./assets/totp-function.ts', import.meta.url)
      ),
      functionName: 'totp-generator-function',
      bundling: {
        minify: true,
        sourceMap: true,
        target: 'es2022',
      },
      environment: {
        SECRET_NAME: totpSecretName,
      },
      securityGroups: [securityGroup],
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
    })

    const totpKeySecret = secretsmanager.Secret.fromSecretNameV2(
      this,
      'Credentials',
      totpSecretName
    )

    totpKeySecret.grantRead(totpFunction)

    new cdk.CfnOutput(this, 'TotpFunctionOutputArn', {
      exportName: 'TotpFunctionArn',
      value: totpFunction.functionArn,
    })
  }
}

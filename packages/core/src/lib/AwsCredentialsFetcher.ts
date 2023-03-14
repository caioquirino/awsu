import { fromNodeProviderChain } from "@aws-sdk/credential-providers"
import type { AwsCredentialIdentity } from "@aws-sdk/types"

export class AwsCredentialsFetcher {

  async fetchCredentials(): Promise<AwsCredentialIdentity> {
    const credentialProvider = fromNodeProviderChain({})
    return credentialProvider()
  }
}

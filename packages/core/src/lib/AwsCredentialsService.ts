import { fromNodeProviderChain } from "@aws-sdk/credential-providers"
import {loadSharedConfigFiles} from "@aws-sdk/shared-ini-file-loader"
import type { AwsCredentialIdentity } from "@aws-sdk/types"
import {Logger} from "log4js"
import {getSsoSessionData} from "@aws-sdk/shared-ini-file-loader/dist-types/getSsoSessionData"
import {CommandExecutor} from "./CommandExecutor"

export type AwsProfile = {
  name: string

  defaultRegion?: string
  defaultRoleName?: string

  sso: boolean
  ssoAccountId?: string
  ssoSession?: string
}

export type FetchCredentialsConfig = {
  profile?: string
}

export class AwsCredentialsService {
  constructor(private readonly logger: Logger, private readonly commandExecutor: CommandExecutor) {}
  async listProfiles(): Promise<AwsProfile[]> {
    const configIniFile = await loadSharedConfigFiles()
    Object.entries(configIniFile).map(([key , value]) => {
      const sso: boolean = Object.keys(value).find(x => x.startsWith("sso")).length > 0

      return {
        name: key,

        defaultRegion: value["region"] || value["sso_region"],
        defaultRoleName: (value["role_arn"]?.split("/").slice(-1)) || value["sso_role_name"],

        sso,
        ssoAccountId: value["sso_account_id"],
        ssoSession: value["sso_session"]
      } as AwsProfile
    })
    return
  }

  async fetchCredentials(config: FetchCredentialsConfig): Promise<AwsCredentialIdentity> {
    const credentialProvider = fromNodeProviderChain({
      profile: config.profile
    })
    return credentialProvider()
  }

  async awsSsoLogin(profile?: string): Promise<void> {
    const extraArguments = profile ? ["--profile", profile] : []
    return this.commandExecutor.executeCommand("aws", ["sso", "login", ...extraArguments])
  }
}

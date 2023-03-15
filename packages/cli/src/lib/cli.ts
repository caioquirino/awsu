import {AwsCredentialsService, CommandExecutor, DotenvLoader} from '@awsu/core'
import {Argument, Command} from 'commander'
import { version } from '../../package.json'
import * as log4js from "log4js"
import {AwsCredentialIdentity} from "@aws-sdk/types/dist-types/identity/AwsCredentialIdentity"

const logger = log4js.getLogger("awsu-cli")
const commandExecutor = new CommandExecutor(logger)
const credentialsService = new AwsCredentialsService(logger, commandExecutor)
const dotenvLoader = new DotenvLoader(logger)

export const program = new Command()
  .name("awsu")
  .description('AWS Utils CLI (npm package awsu-cli)')
  .version(version || "unknown")
  .option("-d, --debug", "show debug logs")
  .option("-p, --profile <profile>", "AWS profile to use")
  .option("-r, --region <region>", "AWS region to use")
  .allowUnknownOption(true)


const execCommand = new Command("exec")
  .name("exec")
  .usage("[options] -- <command>")
  .description("executes any command with injected AWS environment variables")
  .allowExcessArguments(true)
  .option("-e, --env-file <env-file>", "append dotenv file to env vars")
  .addArgument(new Argument("command", "command to run with injected env vars"))
  .allowUnknownOption(true)
  .action(async (command, options, commandObj) => {

    const dotenvEnvVars = options.envFile && await dotenvLoader.load(options.envFile) || {}

    const parentOptions = commandObj.parent.opts()
    const debugEnabled: boolean = parentOptions.debug || false
    logger.level = debugEnabled ? log4js.levels.DEBUG : log4js.levels.WARN

    logger.debug("Command", command)
    logger.debug("ParentOptions", parentOptions)
    logger.debug("Options", options)
    logger.debug("Args", commandObj.args)
    logger.debug("dotenvEnvVars", dotenvEnvVars)

    const profile: string | undefined = parentOptions.profile
    const region: string | undefined = parentOptions.region

    try {
      let credentials: AwsCredentialIdentity
      try{
        credentials = await credentialsService.fetchCredentials({profile})
      } catch(e) {
        if(e.name == "CredentialsProviderError" && e.message.startsWith("Token is expired. To refresh this SSO session")) {
          logger.debug(e)
          logger.warn("Token is expired. Refreshing SSO session.")
          await credentialsService.awsSsoLogin(profile)
          credentials = await credentialsService.fetchCredentials({profile})
        } else {
          throw e
        }
      }

      const credentialsEnvVars = {
        "AWS_ACCESS_KEY_ID": credentials.accessKeyId,
        "AWS_SECRET_ACCESS_KEY": credentials.secretAccessKey,
        "AWS_SESSION_TOKEN": credentials.sessionToken,
      }

      const additionalEnvVars = {}
      if(profile) additionalEnvVars["AWS_PROFILE"] = profile
      if(region) additionalEnvVars["AWS_REGION"] = region

      await commandExecutor.executeCommand(commandObj.args[0], commandObj.args.slice(1), {"AWSU": "true", ...dotenvEnvVars, ...credentialsEnvVars, ...additionalEnvVars})
    } catch(error) {
      logger.error(error.toString())
      logger.debug(error)
      return process.exit(error.exitCode || 1)
    }
  })
program.addCommand(execCommand, {isDefault: true})

export const cli = async (): Promise<void> => {
  await program.parseAsync()
}

import {AwsCredentialsService, CommandExecutor, DotenvLoader} from '@awsu/core'
import { Command } from 'commander'
import { version } from '../../package.json'
import * as log4js from "log4js"

const logger = log4js.getLogger("awsu-cli")
const commandExecutor = new CommandExecutor(logger, {debug: false})
const credentialsService = new AwsCredentialsService(logger)
const dotenvLoader = new DotenvLoader(logger)

const program = new Command()
  .name("awsu-cli")
  .description('AWS Utils CLI (awsu-cli)')
  .version(version || "Unknown")
  .allowUnknownOption(true)
  .option("-d, --debug", "Show debug logs")
  .option("-p, --profile <profile>", "AWS profile to use")
  .option("-r, --region <region>", "AWS region to use")

program.command("exec")
  .name("exec")
  .description("Executes any command with injected AWS environment variables")
  .allowExcessArguments(true)
  .allowUnknownOption(true)
  .option("-e, --env-file <env-file>", "Append dotenv file to env vars")
  .arguments("<cmd>")
  .action(async (command, options, commandObj) => {

    const dotenvEnvVars = await dotenvLoader.load(options.envFile)

    const parentOptions = commandObj.parent.opts()
    const debugEnabled: boolean = parentOptions.debug || false
      logger.level = debugEnabled ? log4js.levels.DEBUG : log4js.levels.WARN

      logger.debug("Command", command)
      logger.debug("ParentOptions", parentOptions)
      logger.debug("Options", options)
      logger.debug("Args", commandObj.args)
      logger.debug("dotenvEnvVars", dotenvEnvVars)

    try {
      const credentials = await credentialsService.fetchCredentials()
      const credentialsEnvVars = {
        "AWS_ACCESS_KEY_ID": credentials.accessKeyId,
        "AWS_SECRET_ACCESS_KEY": credentials.secretAccessKey,
        "AWS_SESSION_TOKEN": credentials.sessionToken,
      }
      await commandExecutor.executeCommand(commandObj.args[0], commandObj.args.slice(1), {"AWSU": "true", ...dotenvEnvVars, ...credentialsEnvVars})
    } catch(error) {
      logger.debug(error)
      return process.exit(error.exitCode || 1)
    }
  })


export const cli = async (): Promise<void> => {
  await program.parseAsync()
}

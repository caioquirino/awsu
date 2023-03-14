import { AwsCredentialsFetcher, CommandExecutor } from '@awsu/core';
import { Command } from 'commander'
import { version } from '../../package.json'

const commandExecutor = new CommandExecutor({debug: false})
const credentialsFetcher = new AwsCredentialsFetcher()

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

    const parentOptions = commandObj.parent.opts()
    const debugEnabled: boolean = parentOptions.debug || false

    if(debugEnabled) {
      console.log("debugEnabled", debugEnabled)
      console.log("Command", command)
      console.log("ParentOptions", parentOptions)
      console.log("Options", options)
      console.log("Args", commandObj.args)
    }

    try {
      const credentials = await credentialsFetcher.fetchCredentials()
      const credentialsEnvVars = {
        "AWS_ACCESS_KEY_ID": credentials.accessKeyId,
        "AWS_SECRET_ACCESS_KEY": credentials.secretAccessKey,
        "AWS_SESSION_TOKEN": credentials.sessionToken,
      }
      await commandExecutor.executeCommand(commandObj.args[0], commandObj.args.slice(1), {"AWSU": "true", ...credentialsEnvVars})
    } catch(e) {
      console.error(e)
      process.exit(e.exitCode || 1)
    }
  })


export const cli = async (): Promise<void> => {

  await program.parseAsync()
}

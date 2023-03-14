import { CommandExecutor } from '@awsu/core';
import { Command } from 'commander'
import { version } from '../../package.json'

const commandExecutor = new CommandExecutor()

const program = new Command()
  .name("awsu-cli")
  .description('AWS Utils CLI (awsu-cli)')
  .version(version || "Unknown")
  .option("-d, --debug", "Show debug logs")
  .option("-p, --profile <profile>", "AWS profile to use")
  .option("-r, --region <region>", "AWS region to use")

program.command("exec")
  .name("exec")
  .description("Executes any command with injected AWS environment variables")
  .allowExcessArguments(true)
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

    await commandExecutor.executeCommand(commandObj.args[0], {"AWSU": "true"}, commandObj.args.slice(1))
  })


export const cli = async (): Promise<void> => {

  await program.parseAsync()
}

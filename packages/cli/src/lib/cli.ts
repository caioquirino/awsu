import { Command } from 'commander'
import {version} from '../../package.json'
import {spawn} from 'child_process'

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

    const child = spawn(commandObj.args[0], commandObj.args.slice(1), {
      stdio: [process.stdin, process.stdout, process.stderr],
      detached: false,
      shell: true,
      env: {"AWSU": "true"}
    })
    child.on('close', (code) => {
      if(code > 0) {
        process.exit(code)
      }
    });
  })


export const cli = async (): Promise<void> => {

  await program.parseAsync()
}

import { Command } from 'commander'
import {version} from '../../package.json'
import {spawn} from 'child_process'

const program = new Command()

const execCommand = program.command("exec")
execCommand.allowExcessArguments(true)
  .option("-p, --profile <profile>", "AWS profile to use")
  .option("-r, --region <region>", "AWS region to use")
  .arguments("<cmd>")
  .action(async (command, options, commandObj) => {
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

program.description('@awslu/cli')
program.version(version || "Unknown")

export const cli = async (): Promise<void> => {

  await program.parseAsync()
}

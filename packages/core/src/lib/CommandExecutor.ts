import {spawn} from 'child_process'

type CommandExecutorConfig = {
  debug?: boolean
  useHostStdio?: boolean
  env?: NodeJS.ProcessEnv
}

const configDefaults: CommandExecutorConfig = {
  debug: false,
  useHostStdio: true,
  env: {}
}
export class CommandExecutor {
  private readonly config: CommandExecutorConfig
  constructor(config: CommandExecutorConfig = configDefaults) {
    this.config = {...configDefaults, ...config}
  }

  async executeCommand(command: string, args: string[], envVariables: NodeJS.ProcessEnv): Promise<void> {
    const mergedEnvVars = {...this.config.env, ...envVariables}

    return new Promise((resolve, reject) => {

      if(this.config.debug) {
        console.log("CommandExecutor.executeCommand input", {command, args, envVariables})
      }

      const child = spawn(command, args, {
        stdio: this.config.useHostStdio ? [process.stdin, process.stdout, process.stderr] : 'pipe',
        detached: false,
        shell: true,
        env: mergedEnvVars
      })
      child.on('close', (exitCode) => {
        if(exitCode > 0) {
          reject(new CommandExecutorError(command, args, mergedEnvVars, exitCode))
        } else {
           resolve()
        }
      });
    })

  }
}

export class CommandExecutorError extends Error {
  constructor(readonly command: string, readonly args: string[], envVariables: NodeJS.ProcessEnv, readonly exitCode: number) {
    super(`Exit code ${exitCode} when executing [${command} ${args.join(" ")}] and environment variables [${JSON.stringify(envVariables)}]`)
  }
}

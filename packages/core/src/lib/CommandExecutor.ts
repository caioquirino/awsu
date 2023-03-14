import {spawn} from 'child_process'

type CommandExecutorConfig = {
  useHostStdio?: boolean
  env?: NodeJS.ProcessEnv
}
export class CommandExecutor {
  constructor(private readonly config: CommandExecutorConfig = {
    useHostStdio: true,
    env: {}
  }) {}

  async executeCommand(command: string, envVariables: NodeJS.ProcessEnv, ...parameters: string[]): Promise<void> {
    const mergedEnvVars = {...this.config.env, ...envVariables}

    return new Promise((resolve, reject) => {
      const child = spawn(command, parameters, {
        stdio: this.config.useHostStdio ? [process.stdin, process.stdout, process.stderr] : 'pipe',
        detached: false,
        shell: true,
        env: mergedEnvVars
      })
      child.on('close', (code) => {
        if(code > 0) {
          reject(new CommandExecutorError(command, parameters, mergedEnvVars, code))
        } else {
           resolve()
        }
      });
    })

  }
}

export class CommandExecutorError extends Error {
  constructor(readonly command: string, readonly parameters: string[], envVariables: NodeJS.ProcessEnv, readonly exitCode: number) {
    super(`Exit code ${exitCode} when executing ${command} with parameters [${parameters.join(', ')}] and environment variables [${JSON.stringify(envVariables)}]`)
  }
}

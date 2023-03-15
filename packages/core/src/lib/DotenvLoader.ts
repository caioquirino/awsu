import * as dotenv from "dotenv"
import {expand} from "dotenv-expand"
import * as path from "path"
import * as fs from 'fs';
import {Logger} from "log4js"
export class DotenvLoader {
  constructor(private readonly logger: Logger) {}
  async load(envFile = '.env'): Promise<NodeJS.ProcessEnv> {

    const dotenvFile = path.resolve(process.cwd(), envFile || '.env')
    const dotenvFileContent = fs.readFileSync(dotenvFile,'utf8');

    const dotEnvVars = dotenv.parse(dotenvFileContent)
    const expanded = expand({
      ignoreProcessEnv: true,
      parsed: {...process.env, ...dotEnvVars}
    }).parsed
    return this.filterOutNonDotEnvVariables(dotEnvVars, expanded)
  }

  filterOutNonDotEnvVariables(dotEnvVars: NodeJS.ProcessEnv, allVars: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
    const allDotEnvVarNames = Object.keys(dotEnvVars)
    return Object.fromEntries(Object.entries(allVars).filter(
      ([key, value]) => allDotEnvVarNames.find((dotEnvKey) => dotEnvKey == key) != undefined
    ))
  }
}

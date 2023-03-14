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

    const dotenvOutput = dotenv.parse(dotenvFileContent)
    return expand({
      ignoreProcessEnv: true,
      parsed: dotenvOutput
    }).parsed
  }
}

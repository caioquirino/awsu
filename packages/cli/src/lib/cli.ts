import { Command } from 'commander'
import {version} from '../../package.json';

const program = new Command();
program.description('@awslu/cli');
program.version(version || "Unknown");

export const cli = async (): Promise<void> => {

  await program.parseAsync();
}

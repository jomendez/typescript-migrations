import chalk from 'chalk';
import { dirname } from 'path';
import { getProgram, migration } from './transformer';
import { ICliOptions } from './types';
import { transformFile } from './writeToFile';

export function deprecatedRxjsHandler(tsConfigPath: string, opts: ICliOptions) {
    const result = migration(getProgram({ tsConfig: tsConfigPath, rootDir: dirname(tsConfigPath) })!);
    console.log(`Total non deprecated subscribes: ${result.totalNonDeprecated}`);
    console.log(`Total deprecated subscribes: ${result.totalDeprecated}`);
    console.log(`Total files affected: ${Object.keys(result.transform).length}`);
    if (!opts.dryRun) {
        transformFile(result.transform);
    } else {
        console.log(chalk.green('No changes were applied (ran with --dry-run flag)'));
    }
}

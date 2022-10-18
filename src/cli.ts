#!/usr/bin/env node

import chalk from 'chalk';
import { Command } from 'commander';
import { dirname } from 'path';
import { getProgram, migration } from './transformer';
import { transformFile } from './writeToFile';
const program = new Command();

interface ICliOptions {
    dryRun?: boolean;
}

function deprecatedSubscribeHandler(tsConfigPath: string, opts: ICliOptions) {
    const result = migration(getProgram({ tsConfig: tsConfigPath, rootDir: dirname(tsConfigPath) })!);
    console.log(`Total non deprecated subscribes: ${result.totalNonDeprecated}`);
    console.log(`Total deprecated subscribes: ${result.totalDeprecated}`);
    console.log(`Total files affected: ${Object.keys(result.transform).length}`);
    if(!opts.dryRun){
      transformFile(result.transform);
    }
}

program
    .command('subscribe <tsconfig.json>')
    .description('Calculate number of deprecated subscribe for your project')
    .option('-d, --dry-run', 'Exclude spec files from report ')
    .action(deprecatedSubscribeHandler);

program.action(() => {
    program.help();
});

program.parse(process.argv);

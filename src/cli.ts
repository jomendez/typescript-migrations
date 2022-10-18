#!/usr/bin/env node

import chalk from 'chalk';
import { Command } from 'commander';
import { dirname } from 'path';
import { getProgram, migration } from './transformer';
import { transformFile } from './writeToFile';
const program = new Command();

interface ICliOptions {
    excludeSpec?: boolean;
    usage?: boolean;
    badVars?: boolean;
}

function deprecatedSubscribeHandler(tsConfigPath: string, opts: ICliOptions) {
    const result = migration(getProgram({ tsConfig: tsConfigPath, rootDir: dirname(tsConfigPath) })!, opts.excludeSpec);
    console.log(`Total non deprecated subscribes: ${result.totalNonDeprecated}`);
    console.log(`Total deprecated subscribes: ${result.totalDeprecated}`);
    transformFile(result.transform);
}

program
    .command('subscribe <tsconfig.json>')
    .description('Calculate number of deprecated subscribe for your project')
    .action(deprecatedSubscribeHandler);

program.action(() => {
    program.help();
});

program.parse(process.argv);

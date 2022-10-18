#!/usr/bin/env node

import chalk from 'chalk';
import { Command } from 'commander';
import { dirname } from 'path';
import { getProgram, migrationReport } from './coverage';
const program = new Command();

interface ICliOptions {
    excludeSpec?: boolean;
    usage?: boolean;
    badVars?: boolean;
}

function deprecatedSubscribeHandler(tsConfigPath: string, opts: ICliOptions) {
    const coverage = migrationReport(
        getProgram({ tsConfig: tsConfigPath, rootDir: dirname(tsConfigPath) })!,
        opts.excludeSpec,
    );
    console.log(`Total non deprecated subscribes: ${coverage.totalNonDeprecated}`);
    console.log(`Total deprecated subscribes: ${coverage.totalDeprecated}`);
}

program
    .command('subscribe <tsconfig.json>')
    .description('Calculate number of deprecated subscribe for your project')
    .action(deprecatedSubscribeHandler);

program.action(() => {
    program.help();
});

program.parse(process.argv);

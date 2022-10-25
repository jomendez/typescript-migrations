#!/usr/bin/env node
import { Command } from 'commander';
import { deprecatedRxjsHandler } from './handlers';

const program = new Command();

program
    .command('rxjs <tsconfig.json>')
    .description('Migrate deprecated rxjs functions for your project')
    .option('-d, --dry-run', 'Run command without making any permanent change')
    .action(deprecatedRxjsHandler);

program.action(() => {
    program.help();
});

program.parse(process.argv);

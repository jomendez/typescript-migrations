import chalk from 'chalk';
import * as ts from 'typescript';

export function migrationReport(program: ts.Program, excludeSpec = false) {
    let sourceFileGlobal: ts.SourceFile;
    const checker = program.getTypeChecker();

    const result = {
        totalNonDeprecated: 0,
        totalDeprecated: 0,
    };

    function report(node: ts.Node, message: string) {
        const { line, character } = sourceFileGlobal.getLineAndCharacterOfPosition(node.getStart());
        console.log(
            chalk.red(`Unknown type found at: ${sourceFileGlobal.fileName} (${line + 1},${character + 1}): ${message}`),
        );
    }

    function visit(node: ts.Node) {
        if (
            ts.isIdentifier(node) &&
            node.escapedText.toString() === 'subscribe' &&
            node.parent &&
            node.parent.parent &&
            ts.isPropertyAccessExpression(node.parent) &&
            ts.isCallExpression(node.parent.parent)
        ) {
          if(node.parent.parent.arguments.some((x) => ts.isObjectLiteralExpression(x)) || node.parent.parent.arguments.length === 1){
            result.totalNonDeprecated++;
          }else{
            result.totalDeprecated++;
          }
        }
        node.forEachChild(visit);
    }

    for (const sourceFile of program.getSourceFiles()) {
        if (
            !sourceFile.isDeclarationFile &&
            !sourceFile.fileName.includes('/node_modules/') &&
            !sourceFile.fileName.includes('/dist/') &&
            !(sourceFile.fileName.includes('.spec.ts') && excludeSpec)
        ) {
            sourceFileGlobal = sourceFile;
            visit(sourceFile);
        }
    }

    return result;
}

export interface ICompilerOptions {
    /**
     * If given, all the file paths in the collected type info will be resolved relative to this directory.
     */
    rootDir?: string;

    /**
     * Path to your project's tsconfig file
     */
    tsConfig?: string;

    // You probably never need to touch these two - they are used by the integration tests to setup
    // a virtual file system for TS:
    tsConfigHost?: ts.ParseConfigHost;
    tsCompilerHost?: ts.CompilerHost;
}

export function getProgram(options: ICompilerOptions) {
    let program: ts.Program | undefined;
    if (options.tsConfig) {
        const configHost = options.tsConfigHost || ts.sys;
        const { config, error } = ts.readConfigFile(options.tsConfig, configHost.readFile);
        if (error) {
            throw new Error(`Error while reading ${options.tsConfig}: ${error.messageText}`);
        }

        const parsed = ts.parseJsonConfigFileContent(config, configHost, options.rootDir || '');
        if (parsed.errors.length) {
            const errors = parsed.errors.map((e) => e.messageText).join(', ');
            throw new Error(`Error while parsing ${options.tsConfig}: ${errors}`);
        }

        program = ts.createProgram(parsed.fileNames, parsed.options, options.tsCompilerHost);
    }
    return program;
}

function aggregateTypes(type: string, aggregatedTypes: Record<string, number>) {
    if (aggregatedTypes[type]) {
        aggregatedTypes[type]++;
    } else {
        aggregatedTypes[type] = 1;
    }
}

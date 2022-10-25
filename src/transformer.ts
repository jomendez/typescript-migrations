import chalk from 'chalk';
import * as ts from 'typescript';
import { isSubscribeNode, isTabNode } from './helpers';
import { ICompilerOptions } from './types';

export function migration(program: ts.Program) {
    let sourceFileGlobal: ts.SourceFile;
    // const checker = program.getTypeChecker();

    const result = {
        totalDeprecated: 0,
        totalNonDeprecated: 0,
        transform: {},
    };

    function report(node: ts.Node, message: string) {
        const { line, character } = sourceFileGlobal.getLineAndCharacterOfPosition(node.getStart());
        console.log(
            chalk.red(
                `Deprecated subscribe found at: ${sourceFileGlobal.fileName} (${line + 1},${character +
                    1}): ${message}`,
            ),
        );
    }

    function visit(node: ts.Node) {
        if (isSubscribeNode(node) || isTabNode(node)) {
            const callExpression = node.parent.parent as ts.CallExpression;
            if (
                callExpression.arguments.some((x) => ts.isObjectLiteralExpression(x)) ||
                callExpression.arguments.length <= 1
            ) {
                result.totalNonDeprecated++;
            } else {
                result.totalDeprecated++;
                report(node, (node as ts.Identifier).escapedText.toString());
                prepareTransform(
                    callExpression.arguments,
                    sourceFileGlobal.getFullText(),
                    callExpression.getFullText(),
                    node.parent.getFullText(),
                    sourceFileGlobal.fileName,
                );
            }
        }
        node.forEachChild(visit);
    }

    function cleanExpression(expression: string) {
        let cleanResult = expression;
        if (expression[0] === '\n') {
            cleanResult = expression.slice(1, expression.length);
        }
        return cleanResult.trimStart();
    }

    function prepareTransform(
        nodeArguments: ts.NodeArray<ts.Expression>,
        fullFileText: string,
        currentDeprecatedCode: string,
        codeToBeCompleted: string,
        filename: string,
    ): void {
        let newArgs = '';

        if (nodeArguments.length === 2) {
            newArgs = `({ next: ${cleanExpression(nodeArguments[0].getFullText())}, error: ${cleanExpression(
                nodeArguments[1].getFullText(),
            )}})`;
        } else if (nodeArguments.length === 3) {
            newArgs = `({ next: ${cleanExpression(nodeArguments[0].getFullText())}, error: ${cleanExpression(
                nodeArguments[1].getFullText(),
            )}, complete: ${cleanExpression(nodeArguments[2].getFullText())}})`;
        }
        const transformedCode = codeToBeCompleted + newArgs;

        if (result.transform[filename]) {
            result.transform[filename] = result.transform[filename].replace(currentDeprecatedCode, transformedCode);
        } else {
            result.transform[filename] = fullFileText.replace(currentDeprecatedCode, transformedCode);
        }
    }

    for (const sourceFile of program.getSourceFiles()) {
        if (
            !sourceFile.isDeclarationFile &&
            !sourceFile.fileName.includes('/node_modules/') &&
            !sourceFile.fileName.includes('/dist/')
        ) {
            sourceFileGlobal = sourceFile;
            visit(sourceFile);
        }
    }

    return result;
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

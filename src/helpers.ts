import * as ts from 'typescript';

export function isSubscribeNode(node: ts.Node): boolean {
    return (
        ts.isIdentifier(node) &&
        node.escapedText.toString() === 'subscribe' &&
        node.parent &&
        node.parent.parent &&
        ts.isPropertyAccessExpression(node.parent) &&
        ts.isCallExpression(node.parent.parent)
    );
}

export function isTabNode(node: ts.Node): boolean {
    return (
        ts.isIdentifier(node) &&
        node.escapedText.toString() === 'tab' &&
        node.parent &&
        node.parent.parent &&
        ts.isCallExpression(node.parent) &&
        ts.isCallExpression(node.parent.parent)
    );
}

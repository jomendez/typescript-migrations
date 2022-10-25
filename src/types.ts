import * as ts from 'typescript';

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

export interface ICliOptions {
    dryRun?: boolean;
}

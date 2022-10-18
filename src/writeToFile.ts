import * as fs from 'fs';

export function transformFile(files) {
    for (const filePath of Object.keys(files)) {
        // const source = fs.readFileSync(filePath, 'utf-8');
        fs.writeFileSync(filePath, files[filePath]);
    }
}

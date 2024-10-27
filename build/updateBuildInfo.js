import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const buildInfo = {
  version: process.env.npm_package_version || '1.0.0',
  buildDate: new Date().toISOString(),
  buildNumber: process.env.BUILD_NUMBER || '0',
  environment: process.env.NODE_ENV || 'development'
};

const content = `// Auto-generated file - DO NOT EDIT
export const buildInfo = ${JSON.stringify(buildInfo, null, 2)};
`;

// Write to the root directory
const outputPath = path.join(__dirname, '..', 'buildInfo.js');
fs.writeFileSync(outputPath, content);

console.log('Build info updated:', buildInfo);
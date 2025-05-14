#!/usr/bin/env node

// This is a simple script to run the loop-decoder test using Node.js
// It compiles the TypeScript and runs the test

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('⚙️ Compiling TypeScript...');

// First compile the TypeScript files
const tsc = spawn('npx', ['tsc', '--project', 'tsconfig.json', 
                          '--outDir', '.test-build', 
                          'src/lib/loop-decoder.ts', 
                          'src/lib/test-loop-decoder.ts'], 
                  { shell: true, stdio: 'inherit' });

tsc.on('exit', (code) => {
  if (code !== 0) {
    console.error('❌ TypeScript compilation failed');
    process.exit(code);
  }
  
  console.log('✅ TypeScript compiled successfully');
  console.log('🧪 Running tests...\n');
  
  // Then run the compiled JavaScript
  const node = spawn('node', ['.test-build/src/lib/test-loop-decoder.js'], 
                     { shell: true, stdio: 'inherit' });
  
  node.on('exit', (code) => {
    if (code !== 0) {
      console.error('❌ Tests failed');
      process.exit(code);
    }
    
    console.log('\n🎉 Tests completed successfully');
  });
}); 
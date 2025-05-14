#!/usr/bin/env node

/**
 * Direct test script for the batch decoder functionality
 * 
 * This imports the necessary functions directly from loop-decoder.ts
 * and compiles them on the fly using ts-node
 */

// Import the batch executor test code
import { spawn } from 'child_process';

console.log('🧪 Testing BatchExecutor Decoder Directly');
console.log('======================================');

// Run ts-node to execute the TypeScript code directly
const tsNode = spawn('npx', ['ts-node', '--esm', '-T', 'src/lib/test-direct.ts'], { 
  stdio: 'inherit', 
  shell: true
});

tsNode.on('close', (code) => {
  if (code !== 0) {
    console.error(`\n❌ Test failed with exit code ${code}`);
    process.exit(code);
  }
}); 
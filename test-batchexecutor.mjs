#!/usr/bin/env node

/**
 * Direct test script for the BatchExecutor decoder functionality
 * 
 * This script uses ts-node to run the TypeScript test file directly
 */

import { spawnSync } from 'child_process';

console.log('🧪 Testing BatchExecutor Decoder');
console.log('===============================');

// Run ts-node to execute the TypeScript test file
const result = spawnSync('npx', ['ts-node', '-T', '--esm', 'src/lib/test-direct.ts'], { 
  stdio: 'inherit', 
  shell: true
});

// Check the result
if (result.status !== 0) {
  console.error(`\n❌ Test failed with exit code ${result.status}`);
  process.exit(result.status || 1);
}

console.log('\n✅ Test completed successfully!'); 
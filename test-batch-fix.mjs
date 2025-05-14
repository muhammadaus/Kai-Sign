#!/usr/bin/env node

/**
 * Test script for the BatchExecutor decoder fix
 * 
 * This script uses ts-node to run the test file directly
 */

import { spawnSync } from 'child_process';

console.log('🧪 Testing BatchExecutor Decoder Fix');
console.log('==================================');

// Run the TypeScript file using npx ts-node
const result = spawnSync('npx', ['ts-node', '-T', 'src/lib/test-batch-decoder.ts'], { 
  stdio: 'inherit', 
  shell: true
});

// Check the result
if (result.status !== 0) {
  console.error(`\n❌ Test failed with exit code ${result.status}`);
  process.exit(result.status || 1);
}

console.log('\n✅ Test completed successfully!'); 
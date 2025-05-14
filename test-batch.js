// Test script for the BatchExecutor decoder
// This script requires the Next.js environment to run

import { decodeTransactionCalldata } from './src/lib/loop-decoder.js';

// Sample executeBatch calldata for two ERC20 transfers to the same address
const TEST_CALLDATA = "0x34fcd5be00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000001200000000000000000000000005dd9fdf2310b5dac8dced8a100fb4952546ae7bd000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000044a9059cbb000000000000000000000000bb6e6d6dabd150c4a000d1fd8a7de46a750477f40000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000000000000000000000000000000000005dd9fdf2310b5dac8dced8a100fb4952546ae7bd000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000044a9059cbb000000000000000000000000bb6e6d6dabd150c4a000d1fd8a7de46a750477f40000000000000000000000000000000000000000000000001bc16d674ec8000000000000000000000000000000000000000000000000000000000000";

// BatchExecutor contract on Sepolia
const BATCH_EXECUTOR_ADDRESS = '0x5dd9fdf2310b5dac8dced8a100fb4952546ae7bd';
const CHAIN_ID = 11155111; // Sepolia

/**
 * Run the test
 */
async function runTest() {
  console.log('🧪 Testing BatchExecutor Decoder');
  console.log('===============================');
  console.log(`Contract: ${BATCH_EXECUTOR_ADDRESS}`);
  console.log(`Chain ID: ${CHAIN_ID}`);
  console.log(`Calldata: ${TEST_CALLDATA.slice(0, 64)}...`);
  
  try {
    // Decode the calldata directly
    const result = await decodeTransactionCalldata(
      CHAIN_ID,
      BATCH_EXECUTOR_ADDRESS,
      TEST_CALLDATA
    );
    
    // Check for errors in the result
    if ('error' in result) {
      console.error('❌ Decoding failed:', result.error);
      if ('details' in result) {
        console.error('Details:', result.details);
      }
      return;
    }
    
    // Success - display the decoded data
    console.log('\n✅ Successfully decoded batch operations');
    console.log('Function Name:', result.name);
    console.log('Function Signature:', result.signature);
    
    // Log the complete result for debugging
    console.log('\nComplete decoded result:');
    console.log(JSON.stringify(result, null, 2));
    
    // Extract operations from the decoded result
    const firstParam = result.params[0];
    if (!firstParam) {
      console.log('❌ No parameters found in the decoded result');
      return;
    }
    
    console.log('\nParameters:');
    console.log(`- Name: ${firstParam.name}`);
    console.log(`- Type: ${firstParam.type}`);
    
    // Check if we have decoded operations
    if (firstParam.valueDecoded && firstParam.valueDecoded.params) {
      const operations = firstParam.valueDecoded.params;
      console.log(`\nFound ${operations.length} operations in the batch:\n`);
      
      // Display each operation
      operations.forEach((op, index) => {
        console.log(`Operation ${index + 1}:`);
        console.log(`  To: ${op.value.to}`);
        console.log(`  Value: ${op.value.value} wei`);
        
        // Display the decoded function call
        if (op.valueDecoded) {
          console.log(`  Function: ${op.valueDecoded.name}`);
          console.log(`  Signature: ${op.valueDecoded.signature}`);
          
          // Display function parameters
          op.valueDecoded.params.forEach(param => {
            console.log(`    ${param.name} (${param.type}): ${param.value}`);
          });
        } else {
          console.log('  Could not decode the calldata for this operation');
        }
        console.log('');
      });
    } else {
      console.log('\n❌ No operations found in the decoded data');
    }
    
    console.log('===============================');
    console.log('🎉 Test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
  }
}

// Run the test
runTest().catch(console.error); 